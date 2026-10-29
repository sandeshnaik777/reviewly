import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from cwd first, then fallback to relative paths
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  appUrl: process.env.APP_URL || 'http://localhost:5173',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:4000',

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production_key_must_be_long_and_random',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieName: 'kindlyreview_auth_token',
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
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_live_TtcTPHvti99kgp',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'zBynQeOeOIjxmux01Cp9le1V',
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
    from: process.env.EMAIL_FROM || 'KindlyRate <no-reply@kindlyrate.com>',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || '',
  },

  awsSms: {
    region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'ap-south-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    senderId: process.env.AWS_SNS_SENDER_ID || 'KNDLYREV',
    entityId: process.env.AWS_SNS_ENTITY_ID || '',
    templateId: process.env.AWS_SNS_TEMPLATE_ID || '',
  },

  rateLimits: {
    loginWindowMs: 60 * 1000,
    loginMaxAttempts: 5,
    customerReviewWindowMs: 60 * 1000,
    customerReviewMaxPerIp: 10,
    globalApiWindowMs: 60 * 1000,
    globalApiMaxPerIp: Number(process.env.GLOBAL_API_MAX_PER_IP || 2000),
  },
};
