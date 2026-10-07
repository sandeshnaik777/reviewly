export type UserRole =
  | 'PLATFORM_ADMIN'
  | 'BUSINESS_OWNER'
  | 'BUSINESS_MANAGER'
  | 'BUSINESS_STAFF'
  | 'CUSTOMER';

export type MainCategory =
  | 'FOOD & HOSPITALITY'
  | 'RETAIL'
  | 'SERVICES'
  | 'HEALTH & WELLNESS'
  | 'EDUCATION'
  | 'ENTERTAINMENT'
  | 'PROFESSIONAL'
  | 'OTHER';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  failedLoginAttempts: number;
  lockoutUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  mainCategory: MainCategory;
  subcategory: string;
  customCategory?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  googleReviewUrl: string;
  logoUrl?: string;
  coverImageUrl?: string;
  description?: string;
  openingHours?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessMember {
  id: string;
  businessId: string;
  userId: string;
  role: UserRole;
  permissions: string[];
  createdAt: string;
}

export type ScaleType = '1-5_STARS' | '1-10_NUMERIC' | 'THUMBS_UP_DOWN';

export interface BusinessQuestion {
  id: string;
  businessId: string;
  questionKey: string;
  label: string;
  scaleType: ScaleType;
  minValue: number;
  maxValue: number;
  displayOrder: number;
  isRequired: boolean;
  isActive: boolean;
}

export interface BusinessSettings {
  id: string;
  businessId: string;
  reviewTone: 'casual' | 'enthusiastic' | 'professional' | 'concise' | 'detailed' | 'warm';
  reviewLength: 'short' | 'medium' | 'detailed';
  customInstructions?: string;
  wordsToAvoid: string[];
  thingsToHighlight: string[];
  autoRedirectGoogle: boolean;
}

export interface QRCodeItem {
  id: string;
  businessId: string;
  slug: string;
  name: string;
  locationTag: string;
  isActive: boolean;
  scanCount: number;
  reviewsGenerated?: number;
  conversionRate?: number;
  googleClicks?: number;
  avgRating?: number;
  lastScan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  slug: 'starter' | 'growth' | 'pro' | 'trial';
  name: string;
  priceInr: number;
  originalPriceInr?: number;
  offerBadge?: string;
  billingPeriod: 'month' | 'year';
  reviewGenerationLimit: number;
  qrCodeLimit: number;
  analyticsEnabled: boolean;
  customQuestionsEnabled: boolean;
  customBrandingEnabled: boolean;
  teamMembersLimit: number;
  features: string[];
  isActive: boolean;
}

export type SubscriptionStatus =
  | 'TRIAL'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELLED'
  | 'EXPIRED';

export interface Subscription {
  id: string;
  businessId: string;
  planId: string;
  status: SubscriptionStatus;
  trialActivated?: boolean;
  selectedNextPlanId?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart?: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsageRecord {
  id: string;
  businessId: string;
  periodMonth: string; // YYYY-MM
  reviewsGeneratedCount: number;
  qrScansCount: number;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  businessId: string;
  subscriptionId?: string;
  planId?: string;
  orderId: string;
  paymentId?: string;
  amountInr: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
  provider: 'RAZORPAY' | 'STRIPE' | 'MOCK';
  providerReference?: string;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSession {
  id: string;
  businessId: string;
  qrCodeId?: string;
  sessionToken: string;
  ipHash: string;
  createdAt: string;
}

export interface GeneratedReview {
  id: string;
  businessId: string;
  sessionId: string;
  ratingsSnapshot: Record<string, number>;
  customerComment?: string;
  generatedText: string;
  editedText?: string;
  sentiment: 'positive' | 'neutral' | 'constructive_critical';
  isCopied: boolean;
  isGoogleClicked: boolean;
  createdAt: string;
}

export type AnalyticsEventType =
  | 'QR_SCAN'
  | 'RATING_SUBMISSION'
  | 'REVIEW_GENERATED'
  | 'REVIEW_COPIED'
  | 'GOOGLE_MAPS_CLICK';

export interface AnalyticsEvent {
  id: string;
  businessId: string;
  qrCodeId?: string;
  eventType: AnalyticsEventType;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  businessId?: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface EmailVerificationRecord {
  id: string;
  userId: string;
  email: string;
  codeHash: string;
  expiresAt: string;
  attempts: number;
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' | 'PROMO';
  targetBusinessId?: string; // empty/null = all merchants
  createdAt: string;
  createdBy?: string;
}

export interface CustomSoftwareInquiry {
  id: string;
  businessId?: string;
  businessName?: string;
  ownerEmail?: string;
  serviceType: string;
  contactPhone: string;
  requirements?: string;
  status: 'PENDING' | 'CONTACTED' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  readTime: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

