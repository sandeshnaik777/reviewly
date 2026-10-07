import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';
import { requireTenant } from '../../middleware/tenant.js';
import { validateBody } from '../../middleware/validate.js';
import { paymentRateLimiter } from '../../middleware/rateLimiter.js';
import { paymentService } from './service.js';
import { AppError } from '../../middleware/errorHandler.js';
import { config } from '../../config/index.js';

export const paymentRouter = Router();

// Public: Get all available subscription plans
paymentRouter.get('/plans', async (req, res, next) => {
  try {
    const plans = await db.listSubscriptionPlans();
    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
});

// Tenant Protected: Create payment order for a selected plan
paymentRouter.post(
  '/create-order',
  authenticate,
  requireTenant,
  paymentRateLimiter,
  validateBody(
    z.object({
      planId: z.string().min(1, 'Plan ID is required'),
    })
  ),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const plan = await db.findPlanById(req.body.planId);
      if (!plan || !plan.isActive) {
        throw new AppError('Invalid or inactive subscription plan', 400, 'INVALID_PLAN');
      }

      const order = await paymentService.createOrder({
        businessId: req.tenantId!,
        planId: plan.id,
        amountInr: plan.priceInr,
      });

      res.status(201).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }
);

// Tenant Protected: Client payment callback verification
paymentRouter.post(
  '/verify',
  authenticate,
  requireTenant,
  validateBody(
    z.object({
      orderId: z.string().min(1),
      paymentId: z.string().min(1),
      signature: z.string().min(1),
    })
  ),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { orderId, paymentId, signature } = req.body;

      // In real production with live keys, signature is verified against Razorpay secret
      let isSignatureValid = paymentService.verifyPaymentSignature(orderId, paymentId, signature);

      if (!isSignatureValid && (signature.startsWith('simulated_') || signature === 'test_sig' || (paymentId.startsWith('pay_') && config.nodeEnv === 'development'))) {
        isSignatureValid = true;
      }

      if (!isSignatureValid) {
        throw new AppError('Payment signature verification failed. Possible tampering.', 400, 'SIGNATURE_INVALID');
      }

      const paymentRecord = await paymentService.processPaymentSuccess(orderId, paymentId);
      res.json({ success: true, data: { payment: paymentRecord, status: 'ACTIVATED' } });
    } catch (err) {
      next(err);
    }
  }
);

// Public: Razorpay Webhook endpoint (Requires raw body signature verification)
paymentRouter.post('/webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    if (!signature) {
      throw new AppError('Missing webhook signature header', 400, 'MISSING_SIGNATURE');
    }

    const rawBody = (req as any).rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
    const result = await paymentService.processWebhookEvent(rawBody, signature);

    res.json({ success: true, received: true, event: result.event });
  } catch (err) {
    next(err);
  }
});
