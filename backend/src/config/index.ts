import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  appUrl: process.env.APP_URL || 'http://localhost:5173',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:4000',

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production_key_must_be_long_and_random',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieName: 'reviewly_auth_token',
  },

  db: {
    databaseUrl: process.env.DATABASE_URL,
    dataFile: process.env.DATABASE_FILE || './data/review_platform.json',
  },

  redis: {
    url: process.env.REDIS_URL,
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-flash-latest',
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_Tl2MArOfBOPxJJ',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'xBpdUXMs0YQbRQ8Wrb0EpzcH',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_sample',
  },

  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@reviewplatform.local',
    initialPassword: process.env.ADMIN_INITIAL_PASSWORD || 'AdminSecurePassword123!',
  },

  email: {
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'Reviewly <no-reply@reviewly.local>',
  },

  rateLimits: {
    loginWindowMs: 60 * 1000,
    loginMaxAttempts: 5,
    customerReviewWindowMs: 60 * 1000,
    customerReviewMaxPerIp: 10,
    globalApiWindowMs: 60 * 1000,
    globalApiMaxPerIp: 120,
  },
};
