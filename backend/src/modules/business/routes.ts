import crypto from 'crypto';
import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';
import { requireTenant } from '../../middleware/tenant.js';
import { validateBody } from '../../middleware/validate.js';
import { CATEGORIES_CATALOG, getDefaultQuestionsForCategory } from './categories.js';
import { subscriptionService } from '../subscription/service.js';
import { Business, Subscription } from '../../types/index.js';

export const businessRouter = Router();

// Public: List all business categories & default templates
businessRouter.get('/categories', (req, res) => {
  res.json({
    success: true,
    data: CATEGORIES_CATALOG,
  });
});

// Authenticated: Get all businesses of current user
businessRouter.get('/my', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const list = await db.findBusinessesByOwnerId(req.user!.id);
    res.json({ success: true, data: list });
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
      description: z.string().optional(),
      openingHours: z.string().optional(),
      logoUrl: z.string().optional(),
      coverImageUrl: z.string().optional(),
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
      customInstructions: z.string().optional(),
      wordsToAvoid: z.array(z.string()).default([]),
      thingsToHighlight: z.array(z.string()).default([]),
      autoRedirectGoogle: z.boolean().default(false),
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
    const analytics = await db.getBusinessAnalytics(req.tenantId!);
    res.json({ success: true, data: analytics });
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

      // Subscription Setup (7-day trial pass with ₹2 verification)
      const postTrialPlan = (await db.findPlanBySlug(data.planSlug)) || (await db.findPlanBySlug('starter'))!;
      const trialPlan = (await db.findPlanBySlug('trial')) || postTrialPlan;
      const now = new Date();
      const periodEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

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

