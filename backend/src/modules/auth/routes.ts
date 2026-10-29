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
import { User, Business, Subscription, BusinessSettings, PasswordResetRecord } from '../../types/index.js';
import { getDefaultQuestionsForCategory } from '../business/categories.js';
import { emailService } from '../email/service.js';
import { smsService } from '../sms/service.js';
import { validatePhoneNumber } from '../../utils/phoneValidator.js';

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
  googleMapsShareUrl: z.string().optional(),
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
function sendAuthToken(user: User, res: Response, req?: Request) {
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: '7d' }
  );

  const isHttps = Boolean(req && (req.secure || req.headers['x-forwarded-proto'] === 'https'));

  res.cookie(config.jwt.cookieName, token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
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

    const token = sendAuthToken(newUser, res, req);

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
        googleMapsShareUrl: data.googleMapsShareUrl,
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

    // 5. Subscription Setup (Testing Pack trial starter with ₹79 offer)
    const postTrialPlan = (await db.findPlanBySlug(data.planSlug)) || (await db.findPlanBySlug('starter'))!;
    const trialPlan = (await db.findPlanBySlug('starter')) || postTrialPlan;
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const subscription: Subscription = {
      id: crypto.randomUUID(),
      businessId,
      planId: trialPlan.id,
      selectedNextPlanId: postTrialPlan.id,
      status: 'TRIAL',
      trialActivated: false, // Activated upon payment
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

    const token = sendAuthToken(userToUse, res, req);

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

    const token = sendAuthToken(user, res, req);
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
 * Helper to build Google OAuth redirect URI
 */
function getGoogleRedirectUri(req: Request): string {
  if (config.google.callbackUrl) {
    return config.google.callbackUrl;
  }
  const proto = (req.headers['x-forwarded-proto'] as string) || (req.secure ? 'https' : 'http');
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'localhost:4000';
  return `${proto}://${host}/api/auth/google/callback`;
}

/**
 * GET /api/auth/google/login
 * Redirects the user's browser to the Google OAuth 2.0 Consent Screen
 */
authRouter.get('/google/login', (req: Request, res: Response) => {
  const clientId = config.google.clientId;
  if (!clientId) {
    return res.redirect('/?auth_error=google_not_configured');
  }

  const redirectUri = getGoogleRedirectUri(req);
  const flow = (req.query.flow as string) || 'login';
  const statePayload = {
    flow,
    nonce: crypto.randomBytes(16).toString('hex'),
    createdAt: Date.now(),
  };
  const state = Buffer.from(JSON.stringify(statePayload)).toString('base64url');

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'select_account');
  authUrl.searchParams.set('state', state);

  res.redirect(authUrl.toString());
});

/**
 * GET /api/auth/google/callback
 * Handles Google OAuth 2.0 authorization code exchange
 */
authRouter.get('/google/callback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, state, error: googleError } = req.query;

    let flow = 'login';
    if (state && typeof state === 'string') {
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
        flow = decoded.flow || 'login';
      } catch {}
    }

    if (googleError) {
      console.warn('[GoogleOAuth] Google returned error:', googleError);
      return res.redirect(`/?auth_error=${encodeURIComponent(String(googleError))}`);
    }

    if (!code || typeof code !== 'string') {
      return res.redirect('/?auth_error=missing_code');
    }

    const clientId = config.google.clientId;
    const clientSecret = config.google.clientSecret;
    if (!clientId || !clientSecret) {
      console.error('[GoogleOAuth] Missing clientId or clientSecret');
      return res.redirect('/?auth_error=google_credentials_missing');
    }

    const redirectUri = getGoogleRedirectUri(req);

    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error('[GoogleOAuth] Token exchange failed:', errBody);
      return res.redirect('/?auth_error=token_exchange_failed');
    }

    const tokenData = (await tokenRes.json()) as any;
    const accessToken = tokenData.access_token;

    // Fetch user profile from Google
    const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userinfoRes.ok) {
      const errBody = await userinfoRes.text();
      console.error('[GoogleOAuth] Userinfo fetch failed:', errBody);
      return res.redirect('/?auth_error=userinfo_fetch_failed');
    }

    const profile = (await userinfoRes.json()) as any;
    const email = profile.email?.toLowerCase().trim();
    if (!email) {
      return res.redirect('/?auth_error=email_not_provided');
    }

    const name = profile.name || email.split('@')[0];
    const googleId = profile.sub;
    const avatarUrl = profile.picture;

    // Check or create user
    let user = await db.findUserByEmail(email);

    if (user) {
      if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
        return res.redirect('/?auth_error=account_locked');
      }
      user = (await db.updateUser(user.id, {
        emailVerified: true,
        failedLoginAttempts: 0,
        lockoutUntil: undefined,
        googleId: googleId || user.googleId,
        avatarUrl: avatarUrl || user.avatarUrl,
      })) || user;
    } else {
      const randomPassword = crypto.randomBytes(24).toString('hex');
      const passwordHash = bcrypt.hashSync(randomPassword, 10);
      const userId = crypto.randomUUID();

      user = await db.createUser({
        id: userId,
        email,
        passwordHash,
        name,
        role: 'BUSINESS_OWNER',
        isActive: true,
        emailVerified: true,
        failedLoginAttempts: 0,
        googleId,
        avatarUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const token = sendAuthToken(user, res, req);
    const businesses = await db.findBusinessesByOwnerId(user.id);

    // If merchant already has business and was logging in, send to dashboard
    if (businesses.length > 0 && flow !== 'onboarding') {
      return res.redirect(`/?token=${token}&google=success&flow=dashboard`);
    }

    // New merchant or onboarding flow: send directly to onboarding Step 2
    return res.redirect(
      `/?token=${token}&google=success&flow=onboarding&step=2&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`
    );
  } catch (err) {
    next(err);
  }
});

const googleAuthSchema = z.object({
  credential: z.string().optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  picture: z.string().optional(),
  googleId: z.string().optional(),
});

/**
 * POST /api/auth/google
 * Google One Tap & OAuth 2.0 Sign-In / Sign-Up
 */
authRouter.post('/google', loginRateLimiter, validateBody(googleAuthSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { credential, email: directEmail, name: directName, picture: directPicture, googleId: directGoogleId } = req.body;

    let email = directEmail;
    let name = directName;
    let googleId = directGoogleId;
    let avatarUrl = directPicture;

    // If Google ID token credential was provided, verify with Google tokeninfo
    if (credential) {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
        if (verifyRes.ok) {
          const tokenInfo = (await verifyRes.json()) as any;
          if (tokenInfo.email) {
            email = tokenInfo.email;
            name = tokenInfo.name || name || tokenInfo.email.split('@')[0];
            googleId = tokenInfo.sub || googleId;
            avatarUrl = tokenInfo.picture || avatarUrl;
          }
        } else {
          const errText = await verifyRes.text();
          console.warn('[GoogleAuth] Token verification returned non-200:', errText);
        }
      } catch (verifyErr) {
        console.warn('[GoogleAuth] Token verification network error:', verifyErr);
      }
    }

    if (!email) {
      throw new AppError('Unable to verify Google account credentials. Please try again.', 400, 'GOOGLE_AUTH_FAILED');
    }

    email = email.toLowerCase().trim();

    // Check if user exists
    let user = await db.findUserByEmail(email);

    if (user) {
      // Existing user: check lockout
      if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
        const remainingMin = Math.ceil((new Date(user.lockoutUntil).getTime() - Date.now()) / (60 * 1000));
        throw new AppError(`Account is temporarily locked. Try again in ${remainingMin} minutes.`, 403, 'ACCOUNT_LOCKED');
      }

      // Update user with googleId, emailVerified: true if not already set
      user = (await db.updateUser(user.id, {
        emailVerified: true,
        failedLoginAttempts: 0,
        lockoutUntil: undefined,
        googleId: googleId || user.googleId,
        avatarUrl: avatarUrl || user.avatarUrl,
      })) || user;
    } else {
      // New user from Google Sign In
      const randomPassword = crypto.randomBytes(24).toString('hex');
      const passwordHash = bcrypt.hashSync(randomPassword, 10);
      const userId = crypto.randomUUID();

      user = await db.createUser({
        id: userId,
        email,
        passwordHash,
        name: name || email.split('@')[0],
        role: 'BUSINESS_OWNER',
        isActive: true,
        emailVerified: true,
        failedLoginAttempts: 0,
        googleId,
        avatarUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const token = sendAuthToken(user, res, req);
    const businesses = await db.findBusinessesByOwnerId(user.id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
          avatarUrl: user.avatarUrl,
        },
        businesses,
        isNewUser: !user.createdAt || (Date.now() - new Date(user.createdAt).getTime()) < 5000,
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
 * POST /api/auth/forgot-password
 * Initiates a password reset by generating a secure 6-digit OTP + reset token
 * and dispatching an email to the user.
 */
authRouter.post(
  '/forgot-password',
  loginRateLimiter,
  validateBody(
    z.object({
      email: z.string().email('Please enter a valid email address'),
    })
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = req.body.email.toLowerCase().trim();
      const user = await db.findUserByEmail(email);

      // Return consistent success message to prevent user enumeration
      if (!user) {
        return res.json({
          success: true,
          message: 'If an account exists with this email, a password reset code has been sent.',
          data: { email },
        });
      }

      // Check 60-second cooldown between reset requests
      const latest = await db.findLatestPasswordResetByEmail(email);
      if (latest && !latest.used) {
        const elapsedMs = Date.now() - new Date(latest.createdAt).getTime();
        if (elapsedMs < 60 * 1000) {
          const waitSec = Math.ceil((60 * 1000 - elapsedMs) / 1000);
          throw new AppError(
            `Please wait ${waitSec}s before requesting a new password reset code.`,
            429,
            'RATE_LIMIT_COOLDOWN'
          );
        }
      }

      // 6-digit OTP code & 24-byte hex token
      const otp = crypto.randomInt(100000, 999999).toString();
      const codeHash = crypto.createHash('sha256').update(otp).digest('hex');
      const token = crypto.randomBytes(24).toString('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

      await db.createPasswordReset({
        id: crypto.randomUUID(),
        userId: user.id,
        email,
        codeHash,
        token,
        expiresAt,
        attempts: 0,
        used: false,
        createdAt: new Date().toISOString(),
      });

      // Construct direct 1-click reset URL
      const appUrl = config.appUrl || 'https://kindlyrate.com';
      const resetLink = `${appUrl}/login?resetToken=${token}&email=${encodeURIComponent(email)}`;

      await emailService.sendPasswordResetEmail(user.email, otp, resetLink, user.name);

      res.json({
        success: true,
        message: 'A 6-digit password reset code has been sent to your email.',
        data: {
          email,
          devOtp: config.nodeEnv === 'development' ? otp : undefined,
          devToken: config.nodeEnv === 'development' ? token : undefined,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/reset-password
 * Validates the 6-digit OTP or reset token and updates the user's password.
 */
authRouter.post(
  '/reset-password',
  loginRateLimiter,
  validateBody(
    z.object({
      email: z.string().email('Please enter a valid email address'),
      otp: z.string().length(6, 'Reset code must be 6 digits').optional(),
      token: z.string().min(10, 'Invalid reset token').optional(),
      newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    }).refine((data) => data.otp || data.token, {
      message: 'Either a 6-digit code or a reset token is required',
      path: ['otp'],
    })
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email: rawEmail, otp, token, newPassword } = req.body;
      const email = rawEmail.toLowerCase().trim();

      const user = await db.findUserByEmail(email);
      if (!user) {
        throw new AppError('No account found for this email address.', 404, 'USER_NOT_FOUND');
      }

      let resetRecord: PasswordResetRecord | undefined;

      if (token) {
        resetRecord = await db.findPasswordResetByToken(token);
        if (!resetRecord || resetRecord.email.toLowerCase() !== email) {
          throw new AppError('Invalid or expired password reset link.', 400, 'INVALID_RESET_TOKEN');
        }
      } else if (otp) {
        resetRecord = await db.findLatestPasswordResetByEmail(email);
        if (!resetRecord) {
          throw new AppError('No active password reset request found. Please request a new code.', 400, 'NO_ACTIVE_REQUEST');
        }
      }

      if (!resetRecord || resetRecord.used) {
        throw new AppError('This password reset request has already been used or is invalid. Please request a new code.', 400, 'RESET_CODE_USED');
      }

      // Check expiration
      if (new Date(resetRecord.expiresAt).getTime() < Date.now()) {
        throw new AppError('Password reset code has expired. Please request a new code.', 400, 'RESET_CODE_EXPIRED');
      }

      // Check max attempts
      if (resetRecord.attempts >= 5) {
        throw new AppError('Too many invalid attempts. For security, please request a new reset code.', 429, 'TOO_MANY_ATTEMPTS');
      }

      // If verifying by OTP, check hash
      if (otp) {
        const inputHash = crypto.createHash('sha256').update(otp).digest('hex');
        if (inputHash !== resetRecord.codeHash) {
          await db.updatePasswordResetRecord(resetRecord.id, {
            attempts: resetRecord.attempts + 1,
          });
          const remaining = 5 - (resetRecord.attempts + 1);
          throw new AppError(
            `Invalid 6-digit reset code. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Please request a new code.'}`,
            400,
            'INVALID_OTP'
          );
        }
      }

      // Mark reset record used
      await db.updatePasswordResetRecord(resetRecord.id, { used: true });

      // Hash new password with bcrypt salt
      const salt = bcrypt.genSaltSync(12);
      const passwordHash = bcrypt.hashSync(newPassword, salt);

      // Update user password and clear any lockout / failed attempts
      await db.updateUser(user.id, {
        passwordHash,
        failedLoginAttempts: 0,
        lockoutUntil: undefined,
      });

      // Clear any older resets
      await db.deletePasswordResetsByEmail(email);

      // Create a fresh session token so the user can be immediately authenticated
      const sessionToken = sendAuthToken(user, res, req);
      const businesses = await db.findBusinessesByOwnerId(user.id);

      res.json({
        success: true,
        message: 'Password has been successfully updated! You are now signed in.',
        data: {
          token: sessionToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            emailVerified: user.emailVerified,
          },
          businesses,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

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

      const verifiedUser = updatedUser || targetUser;
      const token = sendAuthToken(verifiedUser, res, req);

      res.json({
        success: true,
        message: 'Email successfully verified!',
        data: {
          token,
          user: {
            id: verifiedUser.id,
            email: verifiedUser.email,
            name: verifiedUser.name,
            role: verifiedUser.role,
            emailVerified: true,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/send-phone-otp
 * Dispatches a 6-digit verification code to the phone via AWS SNS SMS
 */
authRouter.post(
  '/send-phone-otp',
  validateBody(
    z.object({
      phone: z.string().min(8, 'Phone number must be at least 8 digits'),
      countryCode: z.string().optional(),
    })
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone, countryCode } = req.body;
      const validation = validatePhoneNumber(phone, countryCode);
      if (!validation.isValid) {
        throw new AppError(validation.errorMessage || 'Invalid phone number format.', 400, 'INVALID_PHONE');
      }

      const normalizedPhone = validation.e164;

      // Rate limit cooldown (60 seconds)
      const latest = await db.findLatestPhoneVerification(normalizedPhone);
      if (latest) {
        const elapsedMs = Date.now() - new Date(latest.createdAt).getTime();
        if (elapsedMs < 60 * 1000) {
          const waitSec = Math.ceil((60 * 1000 - elapsedMs) / 1000);
          throw new AppError(
            `Please wait ${waitSec}s before requesting another SMS verification code.`,
            429,
            'RATE_LIMIT_COOLDOWN'
          );
        }
      }

      const otp = crypto.randomInt(100000, 999999).toString();
      const codeHash = crypto.createHash('sha256').update(otp).digest('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      await db.createPhoneVerification({
        id: crypto.randomUUID(),
        phone: normalizedPhone,
        codeHash,
        expiresAt,
        attempts: 0,
        createdAt: new Date().toISOString(),
      });

      const smsResult = await smsService.sendPhoneOtp(normalizedPhone, otp);

      // Mask phone for client privacy (+91 98*** **210)
      const cleanDigits = normalizedPhone.replace(/[^0-9]/g, '');
      const maskedPhone = cleanDigits.length >= 8
        ? normalizedPhone.slice(0, 4) + '****' + normalizedPhone.slice(-3)
        : normalizedPhone;

      res.json({
        success: true,
        message: '6-digit verification code dispatched via SMS.',
        data: {
          phone: maskedPhone,
          deliveryMode: smsResult.mode,
          devOtp: config.nodeEnv === 'development' ? otp : undefined,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/verify-phone-otp
 * Validates 6-digit phone OTP code and updates verification status
 */
authRouter.post(
  '/verify-phone-otp',
  validateBody(
    z.object({
      phone: z.string().min(8),
      otp: z.string().length(6, 'Verification code must be 6 digits'),
      countryCode: z.string().optional(),
    })
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone, otp, countryCode } = req.body;
      const validation = validatePhoneNumber(phone, countryCode);
      const normalizedPhone = validation.isValid ? validation.e164 : phone;

      const latest = await db.findLatestPhoneVerification(normalizedPhone);
      if (!latest) {
        throw new AppError(
          'No verification request found for this phone number. Please request a new code.',
          400,
          'NO_VERIFICATION_REQUEST'
        );
      }

      if (new Date(latest.expiresAt).getTime() < Date.now()) {
        await db.deletePhoneVerificationRecords(normalizedPhone);
        throw new AppError('Verification code has expired. Please request a new code.', 400, 'CODE_EXPIRED');
      }

      if (latest.attempts >= 5) {
        await db.deletePhoneVerificationRecords(normalizedPhone);
        throw new AppError(
          'Too many failed attempts. Code locked for security. Please request a new code.',
          429,
          'TOO_MANY_ATTEMPTS'
        );
      }

      const inputHash = crypto.createHash('sha256').update(otp.trim()).digest('hex');
      if (inputHash !== latest.codeHash) {
        const newAttempts = latest.attempts + 1;
        await db.updatePhoneVerificationRecord(latest.id, { attempts: newAttempts });
        const remaining = Math.max(0, 5 - newAttempts);
        throw new AppError(
          `Incorrect SMS code. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Code locked. Please request a new code.'}`,
          400,
          'INVALID_CODE'
        );
      }

      // Successful verification
      await db.deletePhoneVerificationRecords(normalizedPhone);

      // If user is authenticated, update their user record
      const cookieToken =
        req.cookies?.[config.jwt.cookieName] ||
        (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.substring(7) : null);

      if (cookieToken) {
        try {
          const decoded = jwt.verify(cookieToken, config.jwt.secret) as any;
          if (decoded?.userId) {
            await db.updateUser(decoded.userId, { phone: normalizedPhone, phoneVerified: true });
          }
        } catch {}
      }

      res.json({
        success: true,
        message: 'Phone number verified successfully!',
        data: {
          phone: normalizedPhone,
          phoneVerified: true,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

