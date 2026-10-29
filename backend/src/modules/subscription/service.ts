import { db } from '../../db/index.js';
import { AppError } from '../../middleware/errorHandler.js';

export class SubscriptionService {
  /**
   * Helper to get current period month string YYYY-MM
   */
  private getCurrentPeriodMonth(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * Checks subscription status and atomically enforces monthly review generation limits.
   */
  async enforceReviewQuota(businessId: string): Promise<{ remaining: number; currentCount: number }> {
    const sub = await db.getBusinessSubscription(businessId);
    if (!sub) {
      throw new AppError('No active subscription found for this business.', 403, 'NO_SUBSCRIPTION');
    }

    // Check expiration
    const now = new Date();
    if (sub.status === 'EXPIRED' || (sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) < now)) {
      throw new AppError('Your subscription or trial has expired. Please renew.', 403, 'SUBSCRIPTION_EXPIRED');
    }

    if (sub.status !== 'ACTIVE' && sub.status !== 'TRIAL') {
      throw new AppError('Subscription is inactive.', 403, 'SUBSCRIPTION_INACTIVE');
    }

    // Require paid active plan or confirmed trial activation
    const isPaidActive = sub.status === 'ACTIVE' || (sub.status === 'TRIAL' && sub.trialActivated === true);
    if (!isPaidActive) {
      throw new AppError(
        'Subscription required: Please activate an active plan to enable live AI review generation.',
        402,
        'SUBSCRIPTION_REQUIRED'
      );
    }

    const plan = await db.findPlanById(sub.planId);
    const limit = plan?.reviewGenerationLimit || 50;
    const periodMonth = this.getCurrentPeriodMonth();

    // Atomic concurrency-safe quota increment
    const quotaResult = await db.atomicCheckAndIncrementReviewQuota(businessId, periodMonth, limit);

    if (!quotaResult.allowed) {
      throw new AppError(
        `Monthly review generation limit (${limit}) reached. Please upgrade your plan.`,
        429,
        'SUBSCRIPTION_LIMIT_REACHED',
        { limit, currentCount: quotaResult.currentCount }
      );
    }

    return {
      remaining: quotaResult.remaining,
      currentCount: quotaResult.currentCount,
    };
  }

  async getBusinessUsageDetails(businessId: string) {
    const sub = await db.getBusinessSubscription(businessId);
    const plan = sub ? await db.findPlanById(sub.planId) : undefined;
    const periodMonth = this.getCurrentPeriodMonth();
    const usage = await db.getUsageRecord(businessId, periodMonth);
    const limit = plan?.reviewGenerationLimit || 50;
    const percentUsed = Math.min(100, Math.round((usage.reviewsGeneratedCount / limit) * 100));
    const isPaidActive = Boolean(
      sub && (sub.status === 'ACTIVE' || (sub.status === 'TRIAL' && sub.trialActivated === true))
    );

    return {
      subscription: sub,
      plan,
      isPaidActive,
      periodMonth,
      reviewsUsed: usage.reviewsGeneratedCount,
      reviewLimit: limit,
      reviewsRemaining: Math.max(0, limit - usage.reviewsGeneratedCount),
      percentUsed,
      isNearLimit: percentUsed >= 80,
    };
  }
}

export const subscriptionService = new SubscriptionService();
