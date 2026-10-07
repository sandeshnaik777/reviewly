import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { AppError } from '../../middleware/errorHandler.js';
import { customerReviewRateLimiter, qrScanRateLimiter } from '../../middleware/rateLimiter.js';
import { validateBody } from '../../middleware/validate.js';
import { aiReviewService } from '../ai/service.js';
import { subscriptionService } from '../subscription/service.js';
import { ReviewSession, GeneratedReview } from '../../types/index.js';

export const customerRouter = Router();

/**
 * GET /api/customer/qr/:slug
 * Customer scans QR code:
 * 1. Resolves QR code and associated business
 * 2. Increments scan count
 * 3. Logs QR_SCAN analytics event
 * 4. Returns public profile, Google Review URL, and active review questions
 */
customerRouter.get('/qr/:slug', qrScanRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug as string;
    const qr = await db.findQRCodeBySlug(slug);

    if (!qr || !qr.isActive) {
      throw new AppError('This review QR code is either invalid or inactive.', 404, 'QR_NOT_FOUND');
    }

    const business = await db.findBusinessById(qr.businessId);
    if (!business || !business.isActive) {
      throw new AppError('This business is currently unavailable.', 404, 'BUSINESS_NOT_FOUND');
    }

    // Increment scan count and track funnel event
    await db.incrementQRScan(slug);
    await db.trackAnalyticsEvent({
      id: crypto.randomUUID(),
      businessId: business.id,
      qrCodeId: qr.id,
      eventType: 'QR_SCAN',
      metadata: { ip: req.ip, userAgent: req.headers['user-agent'] },
      createdAt: new Date().toISOString(),
    });

    // Create anonymous review session token
    const sessionToken = crypto.randomBytes(16).toString('hex');
    const session: ReviewSession = {
      id: crypto.randomUUID(),
      businessId: business.id,
      qrCodeId: qr.id,
      sessionToken,
      ipHash: crypto.createHash('sha256').update(req.ip || 'ip').digest('hex'),
      createdAt: new Date().toISOString(),
    };
    await db.createReviewSession(session);

    // Fetch active customized questions
    const questions = await db.getBusinessQuestions(business.id);

    res.json({
      success: true,
      data: {
        sessionToken,
        business: {
          id: business.id,
          name: business.name,
          mainCategory: business.mainCategory,
          subcategory: business.subcategory,
          logoUrl: business.logoUrl,
          coverImageUrl: business.coverImageUrl,
          description: business.description,
          googleReviewUrl: business.googleReviewUrl,
        },
        qrCode: {
          id: qr.id,
          name: qr.name,
          locationTag: qr.locationTag,
        },
        questions: questions.map((q) => ({
          questionKey: q.questionKey,
          label: q.label,
          scaleType: q.scaleType,
          minValue: q.minValue,
          maxValue: q.maxValue,
          isRequired: q.isRequired,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

const generateReviewSchema = z.object({
  sessionToken: z.string().min(1, 'Session token is required'),
  ratings: z.record(z.string(), z.number().min(1).max(10)),
  customerComment: z.string().max(500, 'Comment cannot exceed 500 characters').optional(),
  dishesTried: z.array(z.string().max(60)).max(10).optional(),
  reviewLength: z.enum(['short', 'medium', 'detailed']).optional(),
});

/**
 * POST /api/customer/generate
 * Customer submits question ratings and optional note to generate authentic review
 * 1. Validates anonymous session
 * 2. Checks active subscription and enforces server-side atomic quota
 * 3. Passes ratings to server-side AI Review Service
 * 4. Stores generated review in DB
 * 5. Returns review text for editing and copying
 */
customerRouter.post(
  '/generate',
  customerReviewRateLimiter,
  validateBody(generateReviewSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionToken, ratings, customerComment, dishesTried, reviewLength } = req.body;

      const session = await db.findReviewSessionByToken(sessionToken);
      if (!session) {
        throw new AppError('Invalid or expired review session. Please re-scan QR code.', 401, 'INVALID_SESSION');
      }

      const business = await db.findBusinessById(session.businessId);
      if (!business) {
        throw new AppError('Business not found.', 404, 'BUSINESS_NOT_FOUND');
      }

      // 1. Atomic Subscription Quota Check & Enforcement (Section 10, 16)
      await subscriptionService.enforceReviewQuota(business.id);

      // 2. Persist individual question ratings
      const ratingRecords = Object.entries(ratings).map(([questionKey, ratingValue]) => ({
        id: crypto.randomUUID(),
        sessionId: session.id,
        businessId: business.id,
        questionKey,
        ratingValue: Number(ratingValue),
        createdAt: new Date().toISOString(),
      }));
      await db.saveReviewRatings(ratingRecords);

      // Log RATING_SUBMISSION event
      await db.trackAnalyticsEvent({
        id: crypto.randomUUID(),
        businessId: business.id,
        qrCodeId: session.qrCodeId,
        eventType: 'RATING_SUBMISSION',
        metadata: { ratingsCount: Object.keys(ratings).length, dishesCount: dishesTried?.length || 0 },
        createdAt: new Date().toISOString(),
      });

      // 3. Prepare AI Prompt with business questions and tone
      const questions = await db.getBusinessQuestions(business.id);
      const questionsMap: Record<string, string> = {};
      questions.forEach((q) => {
        questionsMap[q.questionKey] = q.label;
      });

      const settings = (await db.getBusinessSettings(business.id)) || {
        id: '',
        businessId: business.id,
        reviewTone: 'enthusiastic',
        reviewLength: 'medium',
        wordsToAvoid: [],
        thingsToHighlight: [],
        autoRedirectGoogle: false,
      };

      // 4. Server-Side AI Review Generation
      const aiResult = await aiReviewService.generateReview({
        business,
        settings,
        ratings,
        questionsMap,
        customerComment,
        dishesTried,
        reviewLength,
      });

      // 5. Persist Generated Review
      const reviewId = crypto.randomUUID();
      const newReview: GeneratedReview = {
        id: reviewId,
        businessId: business.id,
        sessionId: session.id,
        ratingsSnapshot: ratings,
        customerComment,
        generatedText: aiResult.reviewText,
        sentiment: aiResult.sentiment,
        isCopied: false,
        isGoogleClicked: false,
        createdAt: new Date().toISOString(),
      };
      await db.saveGeneratedReview(newReview);

      // Log REVIEW_GENERATED event
      await db.trackAnalyticsEvent({
        id: crypto.randomUUID(),
        businessId: business.id,
        qrCodeId: session.qrCodeId,
        eventType: 'REVIEW_GENERATED',
        metadata: { reviewId, sentiment: aiResult.sentiment },
        createdAt: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        data: {
          reviewId,
          reviewText: aiResult.reviewText,
          sentiment: aiResult.sentiment,
          googleReviewUrl: business.googleReviewUrl,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/customer/copied
 * Customer clicks "Copy Review" button
 */
customerRouter.post(
  '/copied',
  validateBody(z.object({ reviewId: z.string() })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reviewId } = req.body;
      const review = await db.updateGeneratedReview(reviewId, { isCopied: true });
      if (review) {
        await db.trackAnalyticsEvent({
          id: crypto.randomUUID(),
          businessId: review.businessId,
          eventType: 'REVIEW_COPIED',
          metadata: { reviewId },
          createdAt: new Date().toISOString(),
        });
      }
      res.json({ success: true, data: { copied: true } });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/customer/google-click
 * Customer clicks "Post to Google Maps"
 */
customerRouter.post(
  '/google-click',
  validateBody(z.object({ reviewId: z.string() })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reviewId } = req.body;
      const review = await db.updateGeneratedReview(reviewId, { isGoogleClicked: true });
      if (review) {
        await db.trackAnalyticsEvent({
          id: crypto.randomUUID(),
          businessId: review.businessId,
          eventType: 'GOOGLE_MAPS_CLICK',
          metadata: { reviewId },
          createdAt: new Date().toISOString(),
        });
      }
      res.json({ success: true, data: { clicked: true } });
    } catch (err) {
      next(err);
    }
  }
);
