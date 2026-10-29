import crypto from 'crypto';
import { config } from '../../config/index.js';
import { db } from '../../db/index.js';
import { PaymentRecord, Subscription } from '../../types/index.js';

export interface CreateOrderParams {
  businessId: string;
  planId: string;
  amountInr?: number;
  durationMonths?: number;
  currency?: string;
  isTrial?: boolean;
  autoRenew?: boolean;
  paymentType?: 'trial_verification' | 'direct_subscription' | 'recurring_monthly';
}

export interface OrderResult {
  orderId: string;
  subscriptionId?: string;
  isSubscription?: boolean;
  amount: number;
  amountInr?: number;
  currency: string;
  keyId: string;
}

export interface PaymentService {
  createOrder(params: CreateOrderParams): Promise<OrderResult>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string, subscriptionId?: string): boolean;
  processPaymentSuccess(orderId: string, paymentId: string, providerRef?: string): Promise<PaymentRecord>;
  processWebhookEvent(rawBody: string, signature: string): Promise<{ handled: boolean; event: string }>;
  getSubscription(businessId: string): Promise<Subscription | undefined>;
  getPaymentHistory(businessId: string): Promise<PaymentRecord[]>;
  toggleAutoRenew(businessId: string, enabled: boolean): Promise<Subscription | undefined>;
  processRecurringBilling(): Promise<Array<{ subscriptionId: string; businessId: string; transactionId: string; amountInr: number }>>;
}

// Live Razorpay UPI Autopay Plans (Verified in Razorpay Live Dashboard)
const RAZORPAY_PLAN_MAP_MONTHLY: Record<string, string> = {
  starter: 'plan_TtcqSdkuxmyqoH', // ₹79/mo Testing Pack
  trial: 'plan_TtcqSdkuxmyqoH',
  growth: 'plan_Ttd2A0R5v2g4A9',  // ₹149/mo Growth Pack
  pro: 'plan_Ttd2AG8y0o19Vb',     // ₹249/mo Scale / Pro Pack
};

const RAZORPAY_PLAN_MAP_3MONTHS: Record<string, string> = {
  starter: 'plan_Tte5hayKibAHNI', // ₹229 / 3 mos
  trial: 'plan_Tte5hayKibAHNI',
  growth: 'plan_Tte5U66o8lkzTL',  // ₹429 / 3 mos
  pro: 'plan_Tte5hxelxwrgHw',     // ₹749 / 3 mos
};

const RAZORPAY_PLAN_MAP_6MONTHS: Record<string, string> = {
  starter: 'plan_Tte5hpTIOzZgri', // ₹429 / 6 mos
  trial: 'plan_Tte5hpTIOzZgri',
  growth: 'plan_Tte5ULo6FLycsQ',  // ₹799 / 6 mos
  pro: 'plan_Tte5i5C1tJ4w0p',     // ₹1,449 / 6 mos
};

const RAZORPAY_PLAN_MAP_YEARLY: Record<string, string> = {
  starter: 'plan_TtdVkbhz7I8Eob', // ₹790/yr Testing Pack (2 Mos Free)
  trial: 'plan_TtdVkbhz7I8Eob',
  growth: 'plan_TtdVky0x2dSqAV',  // ₹1,490/yr Growth Pack (2 Mos Free)
  pro: 'plan_TtdVl8YjFaT0Te',     // ₹2,490/yr Scale / Pro Pack (2 Mos Free)
};

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
    const { businessId, planId, amountInr, currency = 'INR', durationMonths = 1, isTrial, autoRenew = true } = params;
    let orderId = `order_${crypto.randomBytes(12).toString('hex')}`;
    let subscriptionId: string | undefined = undefined;
    let isSubscription = false;

    let finalAmount = amountInr;
    let paymentType: 'trial_verification' | 'direct_subscription' | 'recurring_monthly' = 'direct_subscription';

    const plan = await db.findPlanById(planId);

    if (isTrial || finalAmount === 79 || finalAmount === 2) {
      finalAmount = 79;
      paymentType = 'trial_verification';
    } else if (finalAmount === undefined || isNaN(finalAmount)) {
      if (plan) {
        if (durationMonths === 3) {
          finalAmount = plan.priceInr3Months || (plan.priceInr * 3);
        } else if (durationMonths === 6) {
          finalAmount = plan.priceInr6Months || (plan.priceInr * 6);
        } else if (durationMonths === 12) {
          finalAmount = plan.priceInr1Year || (plan.priceInr * 10);
        } else {
          finalAmount = plan.priceInr;
        }
      } else {
        finalAmount = 0;
      }
    }

    // Call live Razorpay API if valid test/live credentials are configured
    if (this.keyId && this.keySecret && this.keyId.startsWith('rzp_')) {
      try {
        const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');

        // Check if Autopay Subscription applies (1M, 3M, 6M, 12M plans with autoRenew)
        const planSlug = isTrial || finalAmount === 79 ? 'trial' : (plan?.slug || 'growth');
        let rzpPlanId: string | undefined = undefined;
        let totalCount = 60; // Default cycle count

        if (autoRenew) {
          if (durationMonths === 12) {
            rzpPlanId = RAZORPAY_PLAN_MAP_YEARLY[planSlug];
            totalCount = 10; // 10 annual billing cycles
          } else if (durationMonths === 6) {
            rzpPlanId = RAZORPAY_PLAN_MAP_6MONTHS[planSlug];
            totalCount = 20; // 20 semi-annual cycles (10 years)
          } else if (durationMonths === 3) {
            rzpPlanId = RAZORPAY_PLAN_MAP_3MONTHS[planSlug];
            totalCount = 40; // 40 quarterly cycles (10 years)
          } else {
            rzpPlanId = RAZORPAY_PLAN_MAP_MONTHLY[planSlug];
            totalCount = 60; // 60 monthly cycles (5 years)
          }
        }

        // If plan with autoRenew enabled, create live Razorpay Autopay Subscription
        if (rzpPlanId) {
          try {
            const subRes = await fetch('https://api.razorpay.com/v1/subscriptions', {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                plan_id: rzpPlanId,
                total_count: totalCount,
                quantity: 1,
                customer_notify: 1,
                notes: {
                  businessId,
                  planId,
                  durationMonths: String(durationMonths),
                  paymentType,
                  autoRenew: 'true',
                },
              }),
            });

            if (subRes.ok) {
              const rzpSub = (await subRes.json()) as any;
              if (rzpSub?.id) {
                subscriptionId = rzpSub.id;
                orderId = rzpSub.id;
                isSubscription = true;
              }
            } else {
              const errText = await subRes.text();
              console.warn('[RazorpayPaymentService] Subscription creation failed, falling back to standard order:', errText);
            }
          } catch (subErr) {
            console.warn('[RazorpayPaymentService] Subscription API error, falling back to standard order:', subErr);
          }
        }

        // Fallback: If not subscription or subscription failed, create standard order
        if (!isSubscription) {
          const res = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: finalAmount * 100, // paisa
              currency,
              receipt: `rcpt_${Date.now().toString(36)}_${businessId.slice(0, 6)}`,
              notes: {
                businessId,
                planId,
                paymentType,
                autoRenew: String(autoRenew),
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
        }
      } catch (apiErr) {
        console.warn('Razorpay API network error, falling back to simulated order:', apiErr);
      }
    }

    // Persist payment record in 'created' state with planId and recurring options
    await db.createPaymentRecord({
      id: crypto.randomUUID(),
      businessId,
      planId,
      orderId,
      amountInr: finalAmount,
      durationMonths,
      currency,
      autoRenew,
      paymentType,
      status: 'created',
      provider: 'RAZORPAY',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return {
      orderId,
      subscriptionId,
      isSubscription,
      amount: finalAmount * 100, // Razorpay uses paisa
      amountInr: finalAmount,
      currency,
      keyId: this.keyId,
    };
  }

  verifyPaymentSignature(orderIdOrSubId: string, paymentId: string, signature: string, subscriptionId?: string): boolean {
    try {
      const subId = subscriptionId || (orderIdOrSubId && orderIdOrSubId.startsWith('sub_') ? orderIdOrSubId : null);

      let expectedSignature: string;
      if (subId) {
        // Razorpay Subscription / UPI Autopay signature verification
        expectedSignature = crypto
          .createHmac('sha256', this.keySecret)
          .update(`${paymentId}|${subId}`)
          .digest('hex');
      } else {
        // Standard Razorpay Order verification
        expectedSignature = crypto
          .createHmac('sha256', this.keySecret)
          .update(`${orderIdOrSubId}|${paymentId}`)
          .digest('hex');
      }

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
      transactionId: paymentId,
      status: 'captured',
      providerReference: providerRef || paymentId,
    });

    // Server-side Subscription activation
    const currentSub = await db.getBusinessSubscription(payment.businessId);
    const now = new Date();
    const plan = payment.planId ? await db.findPlanById(payment.planId) : undefined;
    const isTrial = payment.paymentType === 'trial_verification' || plan?.slug === 'trial' || plan?.slug === 'starter';
    const durMonths = payment.durationMonths || 1;
    let periodDays = 30;
    if (durMonths >= 12) {
      periodDays = 365;
    } else if (durMonths >= 6) {
      periodDays = 180;
    } else if (durMonths >= 3) {
      periodDays = 90;
    } else {
      periodDays = 30; // 30-Day Testing Pack starter period
    }
    const periodEnd = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);

    const autoRenew = payment.autoRenew !== false;
    const newSub: Subscription = {
      id: currentSub?.id || crypto.randomUUID(),
      businessId: payment.businessId,
      planId: payment.planId || currentSub?.planId || 'c0000000-0000-0000-0000-000000000002',
      status: 'ACTIVE',
      trialActivated: true,
      autoRenew,
      billingCycle: durMonths === 12 ? 'yearly' : durMonths === 6 ? 'semi_annual' : durMonths === 3 ? 'quarterly' : 'monthly',
      recurringMandateId: `mandate_${paymentId}`,
      lastTransactionId: paymentId,
      nextBillingDate: periodEnd.toISOString(),
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
      details: { orderId, paymentId, transactionId: paymentId, amountInr: payment.amountInr, isTrial, autoRenew },
      createdAt: now.toISOString(),
    });

    return updatedPayment!;
  }

  async getSubscription(businessId: string): Promise<Subscription | undefined> {
    return db.getBusinessSubscription(businessId);
  }

  async getPaymentHistory(businessId: string): Promise<PaymentRecord[]> {
    return db.listPayments(businessId);
  }

  async toggleAutoRenew(businessId: string, enabled: boolean): Promise<Subscription | undefined> {
    const sub = await db.getBusinessSubscription(businessId);
    if (!sub) return undefined;
    const updated = await db.createOrUpdateSubscription({
      ...sub,
      autoRenew: enabled,
      updatedAt: new Date().toISOString(),
    });
    await db.logAudit({
      id: crypto.randomUUID(),
      businessId,
      action: 'AUTO_RENEW_TOGGLED',
      resourceType: 'SUBSCRIPTION',
      resourceId: sub.id,
      details: { autoRenew: enabled },
      createdAt: new Date().toISOString(),
    });
    return updated;
  }

  async processRecurringBilling(): Promise<Array<{ subscriptionId: string; businessId: string; transactionId: string; amountInr: number }>> {
    const allSubs = await db.listAllSubscriptions();
    const now = new Date();
    const results: Array<{ subscriptionId: string; businessId: string; transactionId: string; amountInr: number }> = [];

    for (const sub of allSubs) {
      if (!sub.autoRenew) continue;
      if (sub.status !== 'ACTIVE' && sub.status !== 'TRIAL') continue;

      const dueDate = sub.nextBillingDate ? new Date(sub.nextBillingDate) : new Date(sub.currentPeriodEnd);
      // If billing cycle is reached
      if (now >= dueDate) {
        const plan = await db.findPlanById(sub.planId);
        const renewalAmount = plan ? plan.priceInr : 149;
        const recurringTxnId = `pay_rec_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
        const recurringOrderId = `order_rec_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;

        // Create transaction record
        await db.createPaymentRecord({
          id: crypto.randomUUID(),
          businessId: sub.businessId,
          planId: sub.planId,
          orderId: recurringOrderId,
          paymentId: recurringTxnId,
          transactionId: recurringTxnId,
          amountInr: renewalAmount,
          currency: 'INR',
          durationMonths: 1,
          autoRenew: true,
          paymentType: 'recurring_monthly',
          status: 'captured',
          provider: 'RAZORPAY',
          providerReference: `auto_recur_${sub.recurringMandateId || recurringTxnId}`,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        });

        // Advance subscription by 30 days
        const nextPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        await db.createOrUpdateSubscription({
          ...sub,
          status: 'ACTIVE',
          trialActivated: false,
          currentPeriodStart: now.toISOString(),
          currentPeriodEnd: nextPeriodEnd.toISOString(),
          nextBillingDate: nextPeriodEnd.toISOString(),
          lastTransactionId: recurringTxnId,
          updatedAt: now.toISOString(),
        });

        await db.logAudit({
          id: crypto.randomUUID(),
          businessId: sub.businessId,
          action: 'RECURRING_MONTHLY_PAYMENT_CAPTURED',
          resourceType: 'PAYMENT',
          resourceId: recurringTxnId,
          details: {
            transactionId: recurringTxnId,
            orderId: recurringOrderId,
            amountInr: renewalAmount,
            nextBillingDate: nextPeriodEnd.toISOString(),
          },
          createdAt: now.toISOString(),
        });

        results.push({
          subscriptionId: sub.id,
          businessId: sub.businessId,
          transactionId: recurringTxnId,
          amountInr: renewalAmount,
        });
      }
    }

    return results;
  }

  async processWebhookEvent(rawBody: string, signature: string): Promise<{ handled: boolean; event: string }> {
    if (!this.verifyWebhookSignature(rawBody, signature)) {
      throw new Error('Invalid Razorpay webhook signature');
    }

    const eventData = JSON.parse(rawBody);
    const eventType = eventData.event;

    if (eventType === 'subscription.charged' || eventType === 'subscription.authenticated') {
      const subEntity = eventData.payload?.subscription?.entity;
      const paymentEntity = eventData.payload?.payment?.entity;
      const subId = subEntity?.id;
      const paymentId = paymentEntity?.id;

      if (subId && paymentId) {
        await this.processPaymentSuccess(subId, paymentId, 'Razorpay UPI Autopay Recurring Charge');
      }
    } else if (eventType === 'payment.captured' || eventType === 'order.paid') {
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
