import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { config } from '../../config/index.js';
import { AppError } from '../../middleware/errorHandler.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';
import { loginRateLimiter } from '../../middleware/rateLimiter.js';
import { validateBody } from '../../middleware/validate.js';
import { User, Business, Subscription, BusinessSettings } from '../../types/index.js';
import { getDefaultQuestionsForCategory } from '../business/categories.js';
import { emailService } from '../email/service.js';

export const authRouter = Router();

const registerSchema = z.object({
  // User Credentials
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  ownerName: z.string().min(2, 'Owner name is required'),
  // Business Info
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
  phone: z.string().min(8, 'Phone number is required'),
  address: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().default('India'),
  pincode: z.string().min(3, 'Pincode is required'),
  googleReviewUrl: z.string().url('Google Review URL must be a valid link'),
  // Profile (Optional)
  description: z.string().optional(),
  openingHours: z.string().optional(),
  // Custom or edited questions
  questions: z
    .array(
      z.object({
        questionKey: z.string().optional(),
        label: z.string().min(1),
        scaleType: z.string().default('1-5_STARS'),
      })
    )
    .optional(),
  // Plan selection (Default: starter for post-trial renewal)
  planSlug: z.enum(['trial', 'starter', 'growth', 'pro']).default('starter'),
});

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Full name is required'),
  phone: z.string().min(6, 'Phone number is required'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Generate JWT and set HTTP-only secure cookie
 */
function sendAuthToken(user: User, res: Response) {
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: '7d' }
  );

  res.cookie(config.jwt.cookieName, token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });

  return token;
}

/**
 * POST /api/auth/signup
 * Step 1 Signup: Registers merchant account credentials upfront, dispatches email verification OTP, and initiates authenticated session
 */
authRouter.post('/signup', validateBody(signupSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const existing = await db.findUserByEmail(data.email);
    if (existing) {
      throw new AppError('An account with this email already exists. Please sign in.', 409, 'EMAIL_EXISTS');
    }

    const salt = bcrypt.genSaltSync(12);
    const passwordHash = bcrypt.hashSync(data.password, salt);
    const userId = crypto.randomUUID();

    const newUser: User = {
      id: userId,
      email: data.email.toLowerCase(),
      passwordHash,
      name: data.name,
      role: 'BUSINESS_OWNER',
      isActive: true,
      emailVerified: false,
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.createUser(newUser);

    // Generate secure 6-digit verification code (valid for 10 minutes)
    const otp = crypto.randomInt(100000, 999999).toString();
    const codeHash = crypto.createHash('sha256').update(otp).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await db.createEmailVerification({
      id: crypto.randomUUID(),
      userId,
      email: newUser.email,
      codeHash,
      expiresAt,
      attempts: 0,
      createdAt: new Date().toISOString(),
    });

    await emailService.sendVerificationOtp(newUser.email, otp, newUser.name);

    const token = sendAuthToken(newUser, res);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role, emailVerified: false },
        devOtp: config.nodeEnv === 'development' ? otp : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/register
 * Implements business registration & onboarding in an idempotent flow
 */
authRouter.post('/register', validateBody(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;

    // Check if user exists
    const existing = await db.findUserByEmail(data.email);
    let userToUse: User;

    if (existing) {
      // Allow idempotent retry if caller is authenticated as this user or supplied correct password
      const cookieToken = req.cookies?.[config.jwt.cookieName] || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.substring(7) : null);
      let isVerified = false;
      if (cookieToken) {
        try {
          const decoded = jwt.verify(cookieToken, config.jwt.secret) as any;
          if (decoded && decoded.userId === existing.id) {
            isVerified = true;
          }
        } catch {}
      }
      if (!isVerified && data.password && bcrypt.compareSync(data.password, existing.passwordHash)) {
        isVerified = true;
      }

      if (!isVerified) {
        throw new AppError('An account with this email already exists. Please sign in.', 409, 'EMAIL_EXISTS');
      }

      userToUse = existing;
    } else {
      // 1. Create User
      const salt = bcrypt.genSaltSync(12);
      const passwordHash = bcrypt.hashSync(data.password, salt);
      const userId = crypto.randomUUID();

      userToUse = {
        id: userId,
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.ownerName,
        role: 'BUSINESS_OWNER',
        isActive: true,
        emailVerified: true,
        failedLoginAttempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.createUser(userToUse);
    }

    const userId = userToUse.id;

    // 2. Create or Find Existing Business
    const existingBusinesses = await db.findBusinessesByOwnerId(userId);
    let targetBusiness = existingBusinesses.find((b) => b.name.toLowerCase() === data.businessName.toLowerCase());

    if (!targetBusiness) {
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
        email: data.email,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country || 'India',
        pincode: data.pincode,
        googleReviewUrl: data.googleReviewUrl,
        description: data.description,
        openingHours: data.openingHours,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.createBusiness(targetBusiness);
    }

    const newBusiness = targetBusiness;
    const businessId = targetBusiness.id;

    // 3. Dynamic Category Questions Setup (Honors user-added or removed criteria)
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

    // 4. Business Review Settings
    const settings: BusinessSettings = {
      id: crypto.randomUUID(),
      businessId,
      reviewTone: 'enthusiastic',
      reviewLength: 'medium',
      wordsToAvoid: [],
      thingsToHighlight: [],
      autoRedirectGoogle: false,
    };
    await db.saveBusinessSettings(settings);

    // 5. Subscription Setup (7-day trial pass with ₹2 verification)
    const postTrialPlan = (await db.findPlanBySlug(data.planSlug)) || (await db.findPlanBySlug('starter'))!;
    const trialPlan = (await db.findPlanBySlug('trial')) || postTrialPlan;
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const subscription: Subscription = {
      id: crypto.randomUUID(),
      businessId,
      planId: trialPlan.id,
      selectedNextPlanId: postTrialPlan.id,
      status: 'TRIAL',
      trialActivated: false, // Activated upon ₹2 payment
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      trialStart: now.toISOString(),
      trialEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    await db.createOrUpdateSubscription(subscription);

    // 6. Generate First QR Code
    const qrSlug = crypto.randomBytes(6).toString('base64url');
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

    // 7. Audit Log
    await db.logAudit({
      id: crypto.randomUUID(),
      businessId,
      userId,
      action: 'BUSINESS_REGISTERED',
      resourceType: 'BUSINESS',
      resourceId: businessId,
      details: { businessName: data.businessName, plan: postTrialPlan.slug },
      ipAddress: req.ip,
      createdAt: now.toISOString(),
    });

    const token = sendAuthToken(userToUse, res);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: userToUse.id, email: userToUse.email, name: userToUse.name, role: userToUse.role },
        business: newBusiness,
        firstQRSlug: qrSlug,
        trialPlan: {
          id: trialPlan.id,
          name: trialPlan.name,
          priceInr: trialPlan.priceInr,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Includes rate limiting, lockout throttling, and bcrypt verification
 */
authRouter.post('/login', loginRateLimiter, validateBody(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await db.findUserByEmail(email);

    if (!user) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    // Check account lockout
    if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
      const remainingMin = Math.ceil((new Date(user.lockoutUntil).getTime() - Date.now()) / (60 * 1000));
      throw new AppError(`Account is temporarily locked. Try again in ${remainingMin} minutes.`, 403, 'ACCOUNT_LOCKED');
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      let lockoutUntil: string | undefined;

      // Lockout after 5 failed attempts for 15 minutes
      if (attempts >= 5) {
        lockoutUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      }

      await db.updateUser(user.id, {
        failedLoginAttempts: attempts,
        lockoutUntil,
      });

      if (lockoutUntil) {
        throw new AppError('Too many failed attempts. Account locked for 15 minutes.', 403, 'ACCOUNT_LOCKED');
      }

      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    // Reset failed attempts on success
    if (user.failedLoginAttempts > 0) {
      await db.updateUser(user.id, { failedLoginAttempts: 0, lockoutUntil: undefined });
    }

    const token = sendAuthToken(user, res);
    const businesses = await db.findBusinessesByOwnerId(user.id);

    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role, emailVerified: user.emailVerified },
        businesses,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 */
authRouter.post('/logout', (req: Request, res: Response) => {
  res.clearCookie(config.jwt.cookieName, { path: '/' });
  res.json({ success: true, data: { message: 'Logged out successfully.' } });
});

/**
 * GET /api/auth/me
 */
authRouter.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const businesses = user.role === 'PLATFORM_ADMIN' ? await db.listAllBusinesses() : await db.findBusinessesByOwnerId(user.id);

    res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name, role: user.role, emailVerified: user.emailVerified },
        businesses,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/send-verification-otp
 * Dispatches a 6-digit verification code with a 60-second cooldown rate limit
 */
authRouter.post('/send-verification-otp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let targetEmail: string | undefined;
    let targetUser: User | undefined;

    // Check if user is authenticated via cookie or header
    const cookieToken =
      req.cookies?.[config.jwt.cookieName] ||
      (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.substring(7) : null);

    if (cookieToken) {
      try {
        const decoded = jwt.verify(cookieToken, config.jwt.secret) as any;
        if (decoded?.userId) {
          targetUser = await db.findUserById(decoded.userId);
          if (targetUser) targetEmail = targetUser.email;
        }
      } catch {}
    }

    if (!targetEmail && req.body.email) {
      targetEmail = req.body.email.toLowerCase().trim();
      targetUser = await db.findUserByEmail(targetEmail as string);
    }

    if (!targetEmail || !targetUser) {
      throw new AppError('Valid email or authentication is required.', 400, 'EMAIL_REQUIRED');
    }

    if (targetUser.emailVerified) {
      return res.json({
        success: true,
        message: 'Your email is already verified.',
        data: { alreadyVerified: true },
      });
    }

    // Enforce 60-second cooldown between requests
    const latest = await db.findLatestVerificationByEmail(targetEmail);
    if (latest) {
      const elapsedMs = Date.now() - new Date(latest.createdAt).getTime();
      if (elapsedMs < 60 * 1000) {
        const waitSec = Math.ceil((60 * 1000 - elapsedMs) / 1000);
        throw new AppError(
          `Please wait ${waitSec}s before requesting a new verification code.`,
          429,
          'RATE_LIMIT_COOLDOWN'
        );
      }
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const codeHash = crypto.createHash('sha256').update(otp).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await db.createEmailVerification({
      id: crypto.randomUUID(),
      userId: targetUser.id,
      email: targetEmail,
      codeHash,
      expiresAt,
      attempts: 0,
      createdAt: new Date().toISOString(),
    });

    await emailService.sendVerificationOtp(targetEmail, otp, targetUser.name);

    res.json({
      success: true,
      message: 'Verification code dispatched to your email.',
      data: {
        email: targetEmail,
        devOtp: config.nodeEnv === 'development' ? otp : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Alias for convenience
authRouter.post('/resend-verification', (req: Request, res: Response, next: NextFunction) => {
  return (authRouter as any).handle({ ...req, url: '/send-verification-otp' }, res, next);
});

/**
 * POST /api/auth/verify-email
 * Validates 6-digit OTP, updates emailVerified status, and resets verification state
 */
authRouter.post(
  '/verify-email',
  validateBody(
    z.object({
      otp: z.string().length(6, 'Verification code must be 6 digits'),
      email: z.string().email().optional(),
    })
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { otp, email } = req.body;
      let targetEmail = email?.toLowerCase().trim();
      let targetUser: User | undefined;

      const cookieToken =
        req.cookies?.[config.jwt.cookieName] ||
        (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.substring(7) : null);

      if (cookieToken) {
        try {
          const decoded = jwt.verify(cookieToken, config.jwt.secret) as any;
          if (decoded?.userId) {
            targetUser = await db.findUserById(decoded.userId);
            if (targetUser) targetEmail = targetUser.email;
          }
        } catch {}
      }

      if (!targetEmail) {
        throw new AppError('Email address is required for verification.', 400, 'EMAIL_REQUIRED');
      }

      if (!targetUser) {
        targetUser = await db.findUserByEmail(targetEmail);
      }

      if (!targetUser) {
        throw new AppError('No account found for this email address.', 404, 'USER_NOT_FOUND');
      }

      if (targetUser.emailVerified) {
        return res.json({
          success: true,
          message: 'Email is already verified.',
          data: {
            user: {
              id: targetUser.id,
              email: targetUser.email,
              name: targetUser.name,
              role: targetUser.role,
              emailVerified: true,
            },
          },
        });
      }

      const latest = await db.findLatestVerificationByEmail(targetEmail);
      if (!latest) {
        throw new AppError(
          'No active verification code found. Please request a new code.',
          400,
          'NO_CODE_FOUND'
        );
      }

      if (new Date() > new Date(latest.expiresAt)) {
        throw new AppError('Verification code has expired. Please request a new code.', 400, 'CODE_EXPIRED');
      }

      if (latest.attempts >= 5) {
        throw new AppError(
          'Too many failed attempts. For security, please request a new verification code.',
          429,
          'MAX_ATTEMPTS_EXCEEDED'
        );
      }

      const inputHash = crypto.createHash('sha256').update(otp.trim()).digest('hex');
      if (inputHash !== latest.codeHash) {
        const newAttempts = latest.attempts + 1;
        await db.updateVerificationRecord(latest.id, { attempts: newAttempts });
        const remaining = Math.max(0, 5 - newAttempts);
        throw new AppError(
          `Incorrect verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Code locked. Please request a new one.'}`,
          400,
          'INVALID_CODE'
        );
      }

      // Mark email as verified
      const updatedUser = await db.updateUser(targetUser.id, { emailVerified: true });
      await db.deleteVerificationRecordsByEmail(targetEmail);

      res.json({
        success: true,
        message: 'Email successfully verified!',
        data: {
          user: {
            id: updatedUser?.id || targetUser.id,
            email: updatedUser?.email || targetUser.email,
            name: updatedUser?.name || targetUser.name,
            role: updatedUser?.role || targetUser.role,
            emailVerified: true,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

