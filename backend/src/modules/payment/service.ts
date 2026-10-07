import crypto from 'crypto';
import { config } from '../../config/index.js';
import { db } from '../../db/index.js';
import { PaymentRecord, Subscription } from '../../types/index.js';

export interface CreateOrderParams {
  businessId: string;
  planId: string;
  amountInr: number;
  currency?: string;
}

export interface OrderResult {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface PaymentService {
  createOrder(params: CreateOrderParams): Promise<OrderResult>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean;
  processPaymentSuccess(orderId: string, paymentId: string, providerRef?: string): Promise<PaymentRecord>;
  processWebhookEvent(rawBody: string, signature: string): Promise<{ handled: boolean; event: string }>;
}

export class RazorpayPaymentService implements PaymentService {
  get keyId(): string {
    return config.razorpay.keyId;
  }
  get keySecret(): string {
    return config.razorpay.keySecret;
  }
  get webhookSecret(): string {
    return config.razorpay.webhookSecret;
  }

  async createOrder(params: CreateOrderParams): Promise<OrderResult> {
    const { businessId, planId, amountInr, currency = 'INR' } = params;
    let orderId = `order_${crypto.randomBytes(12).toString('hex')}`;

    // Call live Razorpay API if valid test/live credentials are configured
    if (this.keyId && this.keySecret && this.keyId.startsWith('rzp_')) {
      try {
        const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
        const res = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amountInr * 100, // paisa
            currency,
            receipt: `rcpt_${Date.now().toString(36)}_${businessId.slice(0, 6)}`,
            notes: {
              businessId,
              planId,
            },
          }),
        });

        if (res.ok) {
          const rzpOrder = (await res.json()) as any;
          if (rzpOrder?.id) {
            orderId = rzpOrder.id;
          }
        } else {
          const errText = await res.text();
          console.warn('Razorpay API order error, falling back to simulated order:', errText);
        }
      } catch (apiErr) {
        console.warn('Razorpay API network error, falling back to simulated order:', apiErr);
      }
    }

    // Persist payment record in 'created' state with planId
    await db.createPaymentRecord({
      id: crypto.randomUUID(),
      businessId,
      planId,
      orderId,
      amountInr,
      currency,
      status: 'created',
      provider: 'RAZORPAY',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return {
      orderId,
      amount: amountInr * 100, // Razorpay uses paisa
      currency,
      keyId: this.keyId,
    };
  }

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');
      const bufA = Buffer.from(expectedSignature);
      const bufB = Buffer.from(signature);
      if (bufA.length !== bufB.length) return false;
      return crypto.timingSafeEqual(bufA, bufB);
    } catch {
      return false;
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('hex');
      const bufA = Buffer.from(expectedSignature);
      const bufB = Buffer.from(signature);
      if (bufA.length !== bufB.length) return false;
      return crypto.timingSafeEqual(bufA, bufB);
    } catch {
      return false;
    }
  }

  async processPaymentSuccess(orderId: string, paymentId: string, providerRef?: string): Promise<PaymentRecord> {
    const payment = await db.findPaymentByOrderId(orderId);
    if (!payment) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Idempotency: If already captured, return without duplicate subscription update
    if (payment.status === 'captured') {
      return payment;
    }

    const updatedPayment = await db.updatePaymentRecord(payment.id, {
      paymentId,
      status: 'captured',
      providerReference: providerRef || paymentId,
    });

    // Server-side Subscription activation
    const currentSub = await db.getBusinessSubscription(payment.businessId);
    const now = new Date();
    const plan = payment.planId ? await db.findPlanById(payment.planId) : undefined;
    const isTrial = plan?.slug === 'trial' || payment.amountInr === 2;
    const periodDays = isTrial ? 7 : 30;
    const periodEnd = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);

    const newSub: Subscription = {
      id: currentSub?.id || crypto.randomUUID(),
      businessId: payment.businessId,
      planId: payment.planId || currentSub?.planId || 'c0000000-0000-0000-0000-000000000001',
      status: isTrial ? 'TRIAL' : 'ACTIVE',
      trialActivated: true,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      trialStart: isTrial ? now.toISOString() : currentSub?.trialStart,
      trialEnd: isTrial ? periodEnd.toISOString() : currentSub?.trialEnd,
      cancelAtPeriodEnd: false,
      createdAt: currentSub?.createdAt || now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await db.createOrUpdateSubscription(newSub);

    await db.logAudit({
      id: crypto.randomUUID(),
      businessId: payment.businessId,
      action: 'PAYMENT_CAPTURED',
      resourceType: 'PAYMENT',
      resourceId: payment.id,
      details: { orderId, paymentId, amountInr: payment.amountInr },
      createdAt: now.toISOString(),
    });

    return updatedPayment!;
  }

  async processWebhookEvent(rawBody: string, signature: string): Promise<{ handled: boolean; event: string }> {
    if (!this.verifyWebhookSignature(rawBody, signature)) {
      throw new Error('Invalid Razorpay webhook signature');
    }

    const eventData = JSON.parse(rawBody);
    const eventType = eventData.event;

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = eventData.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (orderId && paymentId) {
        await this.processPaymentSuccess(orderId, paymentId, paymentEntity.description);
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = eventData.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      if (orderId) {
        const payment = await db.findPaymentByOrderId(orderId);
        if (payment) {
          await db.updatePaymentRecord(payment.id, { status: 'failed' });
        }
      }
    }

    return { handled: true, event: eventType };
  }
}

export const paymentService = new RazorpayPaymentService();
