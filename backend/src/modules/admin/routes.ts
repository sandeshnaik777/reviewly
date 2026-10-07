import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/rbac.js';
import { validateBody } from '../../middleware/validate.js';
import { AppError } from '../../middleware/errorHandler.js';

export const adminRouter = Router();

// Protect all admin routes with authentication and PLATFORM_ADMIN role
adminRouter.use(authenticate, requireAdmin);

// Platform Overview Stats (Section 23)
adminRouter.get('/stats', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await db.getPlatformStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

// List all businesses across the platform with full tenant metadata
adminRouter.get('/businesses', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const businesses = await db.listAllBusinessesDetailed();
    res.json({ success: true, data: businesses });
  } catch (err) {
    next(err);
  }
});

// Admin Manually Creates a Business & Owner
adminRouter.post(
  '/businesses',
  validateBody(
    z.object({
      ownerName: z.string().min(2, 'Owner name is required'),
      email: z.string().email('Invalid email address'),
      phone: z.string().min(8, 'Phone number is required'),
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
      city: z.string().min(2),
      customReviewLimit: z.number().min(10).optional(),
      planSlug: z.string().default('starter'),
      paymentStatus: z.enum(['ACTIVE', 'PAST_DUE', 'TRIAL']).default('ACTIVE'),
      googleReviewUrl: z.string().url().optional(),
    })
  ),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const existingUser = await db.findUserByEmail(req.body.email);
      if (existingUser) {
        throw new AppError('An account with this email already exists.', 409, 'EMAIL_EXISTS');
      }

      const business = await db.adminCreateBusiness(req.body);

      await db.logAudit({
        id: crypto.randomUUID(),
        businessId: business.id,
        userId: req.user!.id,
        action: 'BUSINESS_MANUALLY_CREATED',
        resourceType: 'BUSINESS',
        resourceId: business.id,
        details: { byAdmin: req.user!.email, businessName: business.name },
        createdAt: new Date().toISOString(),
      });

      res.status(201).json({ success: true, data: business });
    } catch (err) {
      next(err);
    }
  }
);

// Admin Overrides Quota Limit for a Business
adminRouter.patch(
  '/businesses/:id/limit',
  validateBody(z.object({ customLimit: z.number().min(1, 'Limit must be at least 1') })),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { customLimit } = req.body;
      const updatedPlan = await db.updateBusinessCustomLimit(id, customLimit);
      if (!updatedPlan) {
        throw new AppError('Business or subscription not found', 404, 'NOT_FOUND');
      }

      await db.logAudit({
        id: crypto.randomUUID(),
        businessId: id,
        userId: req.user!.id,
        action: 'BUSINESS_LIMIT_ADJUSTED',
        resourceType: 'BUSINESS',
        resourceId: id,
        details: { byAdmin: req.user!.email, newLimit: customLimit },
        createdAt: new Date().toISOString(),
      });

      res.json({ success: true, data: { customLimit, plan: updatedPlan } });
    } catch (err) {
      next(err);
    }
  }
);

// Admin Overrides Payment / Subscription Status
adminRouter.patch(
  '/businesses/:id/payment-status',
  validateBody(z.object({ status: z.enum(['ACTIVE', 'PAST_DUE', 'TRIAL', 'EXPIRED']) })),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      const updatedSub = await db.updateBusinessPaymentStatus(id, status);
      if (!updatedSub) {
        throw new AppError('Business subscription not found', 404, 'NOT_FOUND');
      }

      await db.logAudit({
        id: crypto.randomUUID(),
        businessId: id,
        userId: req.user!.id,
        action: 'PAYMENT_STATUS_UPDATED',
        resourceType: 'BUSINESS',
        resourceId: id,
        details: { byAdmin: req.user!.email, newStatus: status },
        createdAt: new Date().toISOString(),
      });

      res.json({ success: true, data: updatedSub });
    } catch (err) {
      next(err);
    }
  }
);

// Admin Logs Call / Contact with Business Owner
adminRouter.post(
  '/businesses/:id/contact-log',
  validateBody(z.object({ note: z.string().min(1, 'Note is required') })),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { note } = req.body;
      const log = await db.addAdminContactLog(id, req.user!.email, note);
      res.status(201).json({ success: true, data: log });
    } catch (err) {
      next(err);
    }
  }
);

// Suspend or Reactivate a business
adminRouter.post(
  '/businesses/:id/toggle-status',
  validateBody(z.object({ isActive: z.boolean() })),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { isActive } = req.body;
      const updated = await db.updateBusiness(id, { isActive });
      if (!updated) {
        throw new AppError('Business not found', 404, 'NOT_FOUND');
      }

      await db.logAudit({
        id: crypto.randomUUID(),
        businessId: id,
        userId: req.user!.id,
        action: isActive ? 'BUSINESS_REACTIVATED' : 'BUSINESS_SUSPENDED',
        resourceType: 'BUSINESS',
        resourceId: id,
        details: { byAdmin: req.user!.email },
        createdAt: new Date().toISOString(),
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
);

// List subscription plans
adminRouter.get('/plans', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const plans = await db.listSubscriptionPlans();
    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
});

// Update plan pricing & quotas
adminRouter.put(
  '/plans/:id',
  validateBody(
    z.object({
      priceInr: z.number().min(0).optional(),
      reviewGenerationLimit: z.number().min(1).optional(),
      qrCodeLimit: z.number().min(1).optional(),
      isActive: z.boolean().optional(),
    })
  ),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const updated = await db.updatePlan(id, req.body);
      if (!updated) {
        throw new AppError('Plan not found', 404, 'NOT_FOUND');
      }
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
);

// View Audit & Abuse logs
adminRouter.get('/audit-logs', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const logs = await db.listAuditLogs();
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
});

// List all broadcast notifications
adminRouter.get('/notifications', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const list = await db.listNotifications();
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

// Broadcast a new notification to all or specific merchant
adminRouter.post(
  '/notifications',
  validateBody(
    z.object({
      title: z.string().min(2, 'Title is required'),
      message: z.string().min(5, 'Message is required'),
      type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ALERT', 'PROMO']).default('INFO'),
      targetBusinessId: z.string().optional(),
    })
  ),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const created = await db.createNotification({
        title: req.body.title,
        message: req.body.message,
        type: req.body.type,
        targetBusinessId: req.body.targetBusinessId,
        createdBy: req.user!.email,
      });

      await db.logAudit({
        id: crypto.randomUUID(),
        userId: req.user!.id,
        action: 'SYSTEM_NOTIFICATION_BROADCAST',
        resourceType: 'NOTIFICATION',
        resourceId: created.id,
        details: { title: created.title, type: created.type, target: created.targetBusinessId || 'ALL' },
        createdAt: new Date().toISOString(),
      });

      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }
);

// Delete a broadcast notification
adminRouter.delete('/notifications/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const deleted = await db.deleteNotification(id);
    res.json({ success: true, data: { deleted } });
  } catch (err) {
    next(err);
  }
});

// List all custom software inquiries
adminRouter.get('/inquiries', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const list = await db.listSoftwareInquiries();
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

// Update inquiry status
adminRouter.patch(
  '/inquiries/:id/status',
  validateBody(
    z.object({
      status: z.enum(['PENDING', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED']),
    })
  ),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const updated = await db.updateSoftwareInquiryStatus(id, req.body.status);
      if (!updated) {
        throw new AppError('Inquiry not found', 404, 'NOT_FOUND');
      }
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
);

// List all blog posts
adminRouter.get('/blogs', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query as { search?: string };
    const blogs = await db.listBlogPosts(search, false);
    res.json({ success: true, data: blogs });
  } catch (err) {
    next(err);
  }
});

// Create new blog post
adminRouter.post(
  '/blogs',
  validateBody(
    z.object({
      title: z.string().min(3, 'Title is required'),
      slug: z.string().optional(),
      excerpt: z.string().min(5, 'Excerpt is required'),
      content: z.string().min(10, 'Content is required'),
      category: z.string().default('GROWTH & REPUTATION'),
      author: z.string().default('Platform Team'),
      readTime: z.string().default('4 min read'),
      tags: z.array(z.string()).default([]),
      isPublished: z.boolean().default(true),
    })
  ),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const created = await db.createBlogPost(req.body);
      await db.logAudit({
        id: crypto.randomUUID(),
        userId: req.user!.id,
        action: 'BLOG_POST_CREATED',
        resourceType: 'BLOG',
        resourceId: created.id,
        details: { title: created.title, slug: created.slug },
        createdAt: new Date().toISOString(),
      });
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }
);

// Update blog post
adminRouter.put(
  '/blogs/:id',
  validateBody(
    z.object({
      title: z.string().min(3).optional(),
      slug: z.string().optional(),
      excerpt: z.string().min(5).optional(),
      content: z.string().min(10).optional(),
      category: z.string().optional(),
      author: z.string().optional(),
      readTime: z.string().optional(),
      tags: z.array(z.string()).optional(),
      isPublished: z.boolean().optional(),
    })
  ),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const updated = await db.updateBlogPost(id, req.body);
      if (!updated) {
        throw new AppError('Blog post not found', 404, 'NOT_FOUND');
      }
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
);

// Delete blog post
adminRouter.delete('/blogs/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const deleted = await db.deleteBlogPost(id);
    res.json({ success: true, data: { deleted } });
  } catch (err) {
    next(err);
  }
});
