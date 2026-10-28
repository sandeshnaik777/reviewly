import crypto from 'crypto';
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';
import { requireTenant } from '../../middleware/tenant.js';
import { validateBody } from '../../middleware/validate.js';
import { CATEGORIES_CATALOG, getDefaultQuestionsForCategory } from './categories.js';
import { subscriptionService } from '../subscription/service.js';
import { mapsRankingService, convertMapsUrlToDirectReviewUrl } from './mapsService.js';
import { Business, Subscription } from '../../types/index.js';
import { AppError } from '../../middleware/errorHandler.js';

export const businessRouter = Router();

// Public: List all business categories & default templates
businessRouter.get('/categories', (req, res) => {
  res.json({
    success: true,
    data: CATEGORIES_CATALOG,
  });
});

// Convert Google Maps share link into direct Google Review link
businessRouter.post(
  '/convert-maps-link',
  validateBody(
    z.object({
      mapsUrl: z.string().min(1, 'Please provide a Google Maps URL'),
    })
  ),
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const result = await convertMapsUrlToDirectReviewUrl(req.body.mapsUrl);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to convert Google Maps link' });
    }
  }
);

// Authenticated: Get all businesses of current user
businessRouter.get('/my', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const list = await db.findBusinessesByOwnerId(req.user!.id);
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

// Tenant Protected: Unified Dashboard Bootstrap (High Speed Single Round-Trip)
businessRouter.get('/:businessId/dashboard-bootstrap', authenticate, requireTenant, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const businessId = req.tenantId!;
    const currentPeriodMonth = new Date().toISOString().slice(0, 7);

    const [
      business,
      usage,
      qrs,
      reviews,
      questions,
      settings,
      analytics,
      plans,
      subscription,
      notifications,
      payments,
    ] = await Promise.all([
      db.findBusinessById(businessId),
      db.getUsageRecord(businessId, currentPeriodMonth),
      db.listQRCodes(businessId),
      db.listBusinessReviews(businessId),
      db.getBusinessQuestions(businessId),
      db.getBusinessSettings(businessId),
      db.getBusinessAnalytics(businessId),
      db.listSubscriptionPlans(),
      db.getBusinessSubscription(businessId),
      db.listNotifications(businessId),
      db.listPayments(businessId),
    ]);

    const plansMap = new Map<string, any>((plans || []).map((p: any) => [p.id, p]));
    const paymentHistory = ((payments as any[]) || [])
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((p: any) => {
        const plan = p.planId ? plansMap.get(p.planId) : undefined;
        return {
          id: p.id,
          orderId: p.orderId,
          paymentId: p.paymentId || p.transactionId,
          transactionId: p.transactionId || p.paymentId || p.orderId,
          amountInr: p.amountInr,
          currency: p.currency,
          durationMonths: p.durationMonths || 1,
          status: p.status,
          provider: p.provider,
          paymentType: p.paymentType || (p.amountInr === 79 || p.amountInr === 2 ? 'trial_verification' : 'direct_subscription'),
          autoRenew: p.autoRenew,
          plan: plan ? { id: (plan as any).id, name: (plan as any).name, slug: (plan as any).slug } : undefined,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        };
      });

    res.json({
      success: true,
      data: {
        business,
        usage,
        qrs,
        reviews,
        questions,
        settings: settings || null,
        analytics,
        plans,
        user: req.user,
        subscription: subscription || null,
        notifications: notifications || [],
        paymentHistory,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Tenant Protected: Get single business details
businessRouter.get('/:businessId', authenticate, requireTenant, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const b = await db.findBusinessById(req.tenantId!);
    res.json({ success: true, data: b });
  } catch (err) {
    next(err);
  }
});

// Tenant Protected: Update business profile
businessRouter.put(
  '/:businessId',
  authenticate,
  requireTenant,
  validateBody(
    z.object({
      name: z.string().min(2).optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
      googleReviewUrl: z.string().url().optional(),
      googleMapsShareUrl: z.string().optional(),
      description: z.string().optional(),
      openingHours: z.string().optional(),
      logoUrl: z.string().optional(),
      coverImageUrl: z.string().optional(),
      instagramUrl: z.string().optional(),
      facebookUrl: z.string().optional(),
      whatsappUrl: z.string().optional(),
    })
  ),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const updated = await db.updateBusiness(req.tenantId!, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
);

// Tenant Protected: Get customized review questions
businessRouter.get('/:businessId/questions', authenticate, requireTenant, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const questions = await db.getBusinessQuestions(req.tenantId!);
    res.json({ success: true, data: questions });
  } catch (err) {
    next(err);
  }
});

// Tenant Protected: Save customized review questions (Add, Remove, Rename, Reorder, Scale)
businessRouter.put(
  '/:businessId/questions',
  authenticate,
  requireTenant,
  validateBody(
    z.object({
      questions: z.array(
        z.object({
          id: z.string().optional(),
          questionKey: z.string().min(1),
          label: z.string().min(1),
          scaleType: z.enum(['1-5_STARS', '1-10_NUMERIC', 'THUMBS_UP_DOWN']).default('1-5_STARS'),
          minValue: z.number().default(1),
          maxValue: z.number().default(5),
          displayOrder: z.number().default(0),
          isRequired: z.boolean().default(true),
          isActive: z.boolean().default(true),
        })
      ),
    })
  ),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const formatted = req.body.questions.map((q: any, idx: number) => ({
        id: q.id || crypto.randomUUID(),
        businessId: req.tenantId!,
        questionKey: q.questionKey,
        label: q.label,
        scaleType: q.scaleType,
        minValue: q.minValue,
        maxValue: q.maxValue,
        displayOrder: idx,
        isRequired: q.isRequired,
        isActive: q.isActive,
      }));

      const saved = await db.saveBusinessQuestions(req.tenantId!, formatted);
      res.json({ success: true, data: saved });
    } catch (err) {
      next(err);
    }
  }
);

// Tenant Protected: Get business review settings
businessRouter.get('/:businessId/settings', authenticate, requireTenant, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const s = await db.getBusinessSettings(req.tenantId!);
    res.json({ success: true, data: s });
  } catch (err) {
    next(err);
  }
});

// Tenant Protected: Update business review settings
businessRouter.put(
  '/:businessId/settings',
  authenticate,
  requireTenant,
  validateBody(
    z.object({
      reviewTone: z.enum(['casual', 'enthusiastic', 'professional', 'concise', 'detailed', 'warm']).default('enthusiastic'),
      reviewLength: z.enum(['short', 'medium', 'detailed']).default('medium'),
      reviewFormat: z.enum(['narrative', 'bullet_highlights', 'casual_conversational', 'professional_critique']).default('narrative').optional(),
      customInstructions: z.string().optional(),
      wordsToAvoid: z.array(z.string()).default([]),
      thingsToHighlight: z.array(z.string()).default([]),
      targetKeywords: z.array(z.string()).default([]).optional(),
      autoRedirectGoogle: z.boolean().default(false),
      // Scratch Card & Reward Engine
      scratchCardEnabled: z.boolean().default(false).optional(),
      scratchCardType: z.enum(['golden_ticket', 'neon_glow', 'festive_confetti', 'minimal_classic']).default('golden_ticket').optional(),
      scratchCardWinProbability: z.number().min(0).max(100).default(100).optional(),
      scratchCardRewardTitle: z.string().optional(),
      scratchCardRewardDescription: z.string().optional(),
      scratchCardCouponCode: z.string().optional(),
      scratchCardCustomLogoUrl: z.string().optional(),
      scratchCardLoseMessage: z.string().optional(),
    })
  ),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const existing = (await db.getBusinessSettings(req.tenantId!)) || {
        id: crypto.randomUUID(),
        businessId: req.tenantId!,
        reviewTone: 'enthusiastic',
        reviewLength: 'medium',
        wordsToAvoid: [],
        thingsToHighlight: [],
        autoRedirectGoogle: false,
      };

      const updated = await db.saveBusinessSettings({
        ...existing,
        ...req.body,
        businessId: req.tenantId!,
      });
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
);

// Tenant Protected: Get Usage & Quota enforcement details (Section 10, 24)
businessRouter.get('/:businessId/usage', authenticate, requireTenant, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const usage = await subscriptionService.getBusinessUsageDetails(req.tenantId!);
    res.json({ success: true, data: usage });
  } catch (err) {
    next(err);
  }
});

// Tenant Protected: Review History with filters (Section 26)
businessRouter.get('/:businessId/reviews', authenticate, requireTenant, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { sentiment, search } = req.query as { sentiment?: string; search?: string };
    let list = await db.listBusinessReviews(req.tenantId!);

    if (sentiment) {
      list = list.filter((r) => r.sentiment === sentiment);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.generatedText.toLowerCase().includes(q));
    }

    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

// Tenant Protected: Full Funnel Analytics (Section 22)
businessRouter.get('/:businessId/analytics', authenticate, requireTenant, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const business = await db.findBusinessById(req.tenantId!);
    if (!business) throw new AppError('Business not found', 404);

    const analytics = await db.getBusinessAnalytics(req.tenantId!);
    const reviews = await db.listBusinessReviews(business.id);
    const avgRating = analytics.avgRating || 0;

    // Dynamically evaluate Google Maps rankings for business's actual city and category
    const mapsData = await mapsRankingService.getRankings(business, reviews.length, avgRating);
    analytics.keywordRankings = mapsData.keywordRankings;
    analytics.competitorRadar = mapsData.competitorRadar;
    analytics.localSeoMetrics = mapsData.localSeoMetrics;
    analytics.isAiGrounding = mapsData.isAiGrounding;
    analytics.geoGrid = mapsData.geoGrid;

    res.json({ success: true, data: analytics });
  } catch (err) {
    next(err);
  }
});

// Tenant Protected: Force Refresh Live Google Maps Ranking & Competitor Radar
businessRouter.post('/:businessId/maps-rankings/refresh', authenticate, requireTenant, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const business = await db.findBusinessById(req.tenantId!);
    if (!business) throw new AppError('Business not found', 404);

    const reviews = await db.listBusinessReviews(business.id);
    const analytics = await db.getBusinessAnalytics(req.tenantId!);
    const avgRating = analytics.avgRating || 0;

    const mapsData = await mapsRankingService.getRankings(business, reviews.length, avgRating, true);
    res.json({ success: true, data: mapsData });
  } catch (err) {
    next(err);
  }
});

// Tenant Protected: Submit Custom Software & Solutions Inquiry
businessRouter.post(
  '/:businessId/custom-software-inquiry',
  authenticate,
  requireTenant,
  validateBody(
    z.object({
      serviceType: z.string().min(2),
      requirements: z.string().optional(),
      contactPhone: z.string().min(6),
    })
  ),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const biz = await db.findBusinessById(req.tenantId!);
      const inquiry = await db.createSoftwareInquiry({
        businessId: req.tenantId!,
        businessName: biz?.name,
        ownerEmail: req.user!.email,
        serviceType: req.body.serviceType,
        contactPhone: req.body.contactPhone,
        requirements: req.body.requirements,
      });

      await db.logAudit({
        id: crypto.randomUUID(),
        businessId: req.tenantId!,
        userId: req.user!.id,
        action: 'CUSTOM_SOFTWARE_INQUIRY',
        resourceType: 'BUSINESS',
        resourceId: req.tenantId!,
        details: {
          inquiryId: inquiry.id,
          businessName: biz?.name,
          serviceType: req.body.serviceType,
          requirements: req.body.requirements,
          contactPhone: req.body.contactPhone,
          ownerEmail: req.user!.email,
        },
        createdAt: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        data: inquiry,
        message: 'Your inquiry has been received! Our solutions engineering team will contact you shortly.',
      });
    } catch (err) {
      next(err);
    }
  }
);

// Public: Submit Custom Enterprise & Bespoke Software Inquiry (No auth required)
businessRouter.post(
  '/public/custom-software-inquiry',
  validateBody(
    z.object({
      name: z.string().optional(),
      businessName: z.string().min(2, 'Business or brand name is required'),
      email: z.string().email().optional(),
      contactPhone: z.string().min(6, 'Valid contact phone number is required'),
      serviceType: z.string().min(2, 'Service type is required'),
      locations: z.string().optional(),
      requirements: z.string().optional(),
    })
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inquiry = await db.createSoftwareInquiry({
        businessId: 'PUBLIC_LEAD',
        businessName: req.body.businessName,
        ownerEmail: req.body.email || 'lead@kindlyrate.com',
        serviceType: req.body.serviceType,
        contactPhone: req.body.contactPhone,
        requirements: `[Lead Name: ${req.body.name || 'N/A'}] [Locations: ${req.body.locations || '1'}] ${req.body.requirements || ''}`,
      });

      res.status(201).json({
        success: true,
        data: inquiry,
        message: 'Your custom software consultation request has been received! Our solutions engineering team will reach out within 2 hours.',
      });
    } catch (err) {
      next(err);
    }
  }
);

// Tenant Protected: List System Notifications & Broadcasts
businessRouter.get('/:businessId/notifications', authenticate, requireTenant, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const list = await db.listNotifications(req.tenantId!);
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

// Authenticated: Setup or update business profile during onboarding
businessRouter.post(
  '/setup',
  authenticate,
  validateBody(
    z.object({
      businessName: z.string().min(2, 'Business name is required'),
      mainCategory: z.enum([
        'FOOD & HOSPITALITY',
        'RETAIL',
        'SERVICES',
        'HEALTH & WELLNESS',
        'EDUCATION',
        'ENTERTAINMENT',
        'PROFESSIONAL',
        'OTHER',
      ]),
      subcategory: z.string().min(2),
      customCategory: z.string().optional(),
      phone: z.string().min(6, 'Phone number is required'),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().default('India'),
      pincode: z.string().optional(),
      googleReviewUrl: z.string().url('Google Review URL must be a valid link'),
      googleMapsShareUrl: z.string().optional(),
      description: z.string().optional(),
      openingHours: z.string().optional(),
      questions: z
        .array(
          z.object({
            questionKey: z.string().optional(),
            label: z.string().min(1),
            scaleType: z.string().default('1-5_STARS'),
          })
        )
        .optional(),
      planSlug: z.enum(['trial', 'starter', 'growth', 'pro']).default('starter'),
    })
  ),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const userId = req.user!.id;

      // Check if business with this name already exists for this owner
      const existingBusinesses = await db.findBusinessesByOwnerId(userId);
      let targetBusiness = existingBusinesses.find((b) => b.name.toLowerCase() === data.businessName.toLowerCase());

      if (targetBusiness) {
        // Update profile
        await db.updateBusiness(targetBusiness.id, {
          mainCategory: data.mainCategory,
          subcategory: data.subcategory,
          customCategory: data.customCategory,
          phone: data.phone,
          address: data.address || targetBusiness.address,
          city: data.city || targetBusiness.city,
          state: data.state || targetBusiness.state,
          country: data.country || targetBusiness.country,
          pincode: data.pincode || targetBusiness.pincode,
          googleReviewUrl: data.googleReviewUrl,
          googleMapsShareUrl: data.googleMapsShareUrl || targetBusiness.googleMapsShareUrl,
          description: data.description,
          openingHours: data.openingHours,
        });
      } else {
        const businessId = crypto.randomUUID();
        const slugBase = data.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const businessSlug = `${slugBase}-${crypto.randomBytes(3).toString('hex')}`;

        targetBusiness = {
          id: businessId,
          ownerId: userId,
          slug: businessSlug,
          name: data.businessName,
          mainCategory: data.mainCategory,
          subcategory: data.subcategory,
          customCategory: data.customCategory,
          phone: data.phone,
          email: req.user!.email,
          address: data.address || 'Central Address',
          city: data.city || 'Metropolis',
          state: data.state || 'State',
          country: data.country || 'India',
          pincode: data.pincode || '000000',
          googleReviewUrl: data.googleReviewUrl,
          googleMapsShareUrl: data.googleMapsShareUrl || undefined,
          description: data.description,
          openingHours: data.openingHours,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await db.createBusiness(targetBusiness);
      }

      const businessId = targetBusiness.id;

      // Save questions
      let questionsToSave;
      if (data.questions && data.questions.length > 0) {
        questionsToSave = data.questions.map((q: any, idx: number) => ({
          id: crypto.randomUUID(),
          businessId,
          questionKey: q.questionKey || `q_${idx + 1}_${crypto.randomBytes(3).toString('hex')}`,
          label: q.label,
          scaleType: (q.scaleType as any) || '1-5_STARS',
          minValue: 1,
          maxValue: 5,
          displayOrder: idx,
          isRequired: true,
          isActive: true,
        }));
      } else {
        const defaultQs = getDefaultQuestionsForCategory(data.mainCategory, data.subcategory);
        questionsToSave = defaultQs.map((q, idx) => ({
          id: crypto.randomUUID(),
          businessId,
          questionKey: q.key,
          label: q.label,
          scaleType: '1-5_STARS' as const,
          minValue: 1,
          maxValue: 5,
          displayOrder: idx,
          isRequired: true,
          isActive: true,
        }));
      }
      await db.saveBusinessQuestions(businessId, questionsToSave);

      // Business Settings
      const existingSettings = await db.getBusinessSettings(businessId);
      if (!existingSettings) {
        await db.saveBusinessSettings({
          id: crypto.randomUUID(),
          businessId,
          reviewTone: 'enthusiastic',
          reviewLength: 'medium',
          wordsToAvoid: [],
          thingsToHighlight: [],
          autoRedirectGoogle: false,
        });
      }

      // Subscription Setup (Testing Pack trial starter with ₹79 offer)
      const postTrialPlan = (await db.findPlanBySlug(data.planSlug)) || (await db.findPlanBySlug('starter'))!;
      const trialPlan = (await db.findPlanBySlug('starter')) || postTrialPlan;
      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const existingSub = await db.getBusinessSubscription(businessId);
      if (!existingSub) {
        const subscription: Subscription = {
          id: crypto.randomUUID(),
          businessId,
          planId: trialPlan.id,
          selectedNextPlanId: postTrialPlan.id,
          status: 'TRIAL',
          trialActivated: false,
          currentPeriodStart: now.toISOString(),
          currentPeriodEnd: periodEnd.toISOString(),
          trialStart: now.toISOString(),
          trialEnd: periodEnd.toISOString(),
          cancelAtPeriodEnd: false,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        };
        await db.createOrUpdateSubscription(subscription);
      }

      // First QR Code
      const existingQRs = await db.listQRCodes(businessId);
      let qrSlug = existingQRs[0]?.slug;
      if (!qrSlug) {
        qrSlug = crypto.randomBytes(6).toString('base64url');
        await db.createQRCode({
          id: crypto.randomUUID(),
          businessId,
          slug: qrSlug,
          name: 'Main Counter',
          locationTag: 'Reception / Counter',
          isActive: true,
          scanCount: 0,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        });
      }

      // Audit Log
      await db.logAudit({
        id: crypto.randomUUID(),
        businessId,
        userId,
        action: 'BUSINESS_REGISTERED',
        resourceType: 'BUSINESS',
        resourceId: businessId,
        details: { businessName: targetBusiness.name, plan: postTrialPlan.slug },
        ipAddress: req.ip,
        createdAt: now.toISOString(),
      });

      res.status(201).json({
        success: true,
        data: {
          business: targetBusiness,
          firstQRSlug: qrSlug,
          trialPlan: {
            id: trialPlan.id,
            name: trialPlan.name,
            priceInr: trialPlan.priceInr,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

