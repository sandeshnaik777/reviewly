import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from '../backend/node_modules/bcryptjs/index.js';

const ADMIN_ID = 'user-admin-kindlyrate-001';
const ADMIN_EMAIL = 'admin@kindlyrate.com';
const ADMIN_PASSWORD = 'AdminSecurePassword123!';

const DEMO_ID = 'user-demo-kindlyrate-002';
const DEMO_EMAIL = 'demo@kindlyrate.com';
const DEMO_PASSWORD = 'DemoRate2026!';

const BIZ_ID = 'biz-demo-store-001';

const now = new Date();
const nowIso = now.toISOString();
const periodStart = new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString();
const periodEnd = new Date(now.getTime() + 353 * 24 * 60 * 60 * 1000).toISOString(); // 1-year subscription

export function generateCleanPlatformData(existingData = {}) {
  const adminPasswordHash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
  const demoPasswordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);

  const cleanData = {
    users: [
      {
        id: ADMIN_ID,
        email: ADMIN_EMAIL,
        passwordHash: adminPasswordHash,
        name: 'Platform Administrator',
        role: 'PLATFORM_ADMIN',
        isActive: true,
        emailVerified: true,
        failedLoginAttempts: 0,
        createdAt: '2026-10-01T00:00:00.000Z',
        updatedAt: nowIso,
      },
      {
        id: DEMO_ID,
        email: DEMO_EMAIL,
        passwordHash: demoPasswordHash,
        name: 'Priya Sharma (Demo Merchant)',
        role: 'BUSINESS_OWNER',
        isActive: true,
        emailVerified: true,
        failedLoginAttempts: 0,
        createdAt: '2026-10-01T00:00:00.000Z',
        updatedAt: nowIso,
      },
    ],
    businesses: [
      {
        id: BIZ_ID,
        ownerId: DEMO_ID,
        name: 'KindlyRate Demo Store',
        slug: 'kindlyrate-demo-store',
        mainCategory: 'FOOD & HOSPITALITY',
        subcategory: 'Artisan Cafe & Bakery',
        phone: '9876543210',
        email: DEMO_EMAIL,
        address: '88 Indiranagar 100 Feet Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        pincode: '560038',
        googleReviewUrl: 'https://maps.google.com/?cid=12345678901234567890',
        googleMapsShareUrl: 'https://maps.app.goo.gl/kindlyrate-demo',
        isActive: true,
        createdAt: periodStart,
        updatedAt: nowIso,
      },
    ],
    businessMembers: [
      {
        id: 'member-demo-001',
        businessId: BIZ_ID,
        userId: DEMO_ID,
        role: 'BUSINESS_OWNER',
        permissions: ['ALL'],
        createdAt: periodStart,
      },
    ],
    businessQuestions: [
      {
        id: 'q-demo-1',
        businessId: BIZ_ID,
        text: 'How was the quality and freshness of our coffee and pastries?',
        category: 'Food & Beverage',
        required: true,
        order: 1,
        active: true,
      },
      {
        id: 'q-demo-2',
        businessId: BIZ_ID,
        text: 'How welcoming and attentive was our barista team?',
        category: 'Customer Service',
        required: true,
        order: 2,
        active: true,
      },
      {
        id: 'q-demo-3',
        businessId: BIZ_ID,
        text: 'How did you like the cafe atmosphere, seating & music?',
        category: 'Ambience',
        required: false,
        order: 3,
        active: true,
      },
    ],
    businessSettings: [
      {
        id: 'settings-demo-001',
        businessId: BIZ_ID,
        minGoogleStars: 4,
        negativeFeedbackDestination: 'BOTH',
        negativeFeedbackPhone: '9876543210',
        negativeFeedbackEmail: DEMO_EMAIL,
        reputationShieldEnabled: true,
        incentiveEnabled: true,
        incentiveDescription: 'Enjoy 15% off your next specialty coffee on your return visit!',
        googleReviewUrl: 'https://maps.google.com/?cid=12345678901234567890',
        primaryColor: '#00383B',
        welcomeMessage: 'Thank you for visiting KindlyRate Demo Cafe! We value your honest feedback.',
        createdAt: periodStart,
        updatedAt: nowIso,
      },
    ],
    qrCodes: [
      {
        id: 'qr-demo-001',
        businessId: BIZ_ID,
        name: 'Billing Counter Smart Stand',
        slug: 'demo-billing-counter',
        type: 'PHYSICAL_STAND',
        location: 'Front Billing Counter',
        scanCount: 142,
        lastScannedAt: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
        isActive: true,
        createdAt: periodStart,
        updatedAt: nowIso,
      },
      {
        id: 'qr-demo-002',
        businessId: BIZ_ID,
        name: 'Table Top Acrylic Stand',
        slug: 'demo-table-stand',
        type: 'TABLE_TENT',
        location: 'Garden Seating Table 4',
        scanCount: 88,
        lastScannedAt: new Date(now.getTime() - 95 * 60 * 1000).toISOString(),
        isActive: true,
        createdAt: periodStart,
        updatedAt: nowIso,
      },
    ],
    subscriptionPlans: existingData.subscriptionPlans || [],
    subscriptions: [
      {
        id: 'sub-demo-001',
        businessId: BIZ_ID,
        planId: 'c0000000-0000-0000-0000-000000000003', // Growth Pack
        status: 'ACTIVE',
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        reviewLimitMonthly: 500,
        reviewsGeneratedThisMonth: 48,
        qrCodeLimit: 5,
        qrCodesActive: 2,
        autoRenew: true,
        lastTransactionId: 'pay_live_demo_growth_1yr',
        createdAt: periodStart,
        updatedAt: nowIso,
      },
    ],
    usageRecords: [
      {
        id: 'usage-demo-001',
        businessId: BIZ_ID,
        period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
        reviewsGenerated: 48,
        qrCodesActive: 2,
        updatedAt: nowIso,
      },
    ],
    payments: [
      {
        id: 'pay-record-demo-001',
        businessId: BIZ_ID,
        orderId: 'order_demo_1year_growth',
        paymentId: 'pay_live_demo_growth_1yr',
        amount: 1490,
        currency: 'INR',
        status: 'CAPTURED',
        paymentType: 'direct_subscription',
        providerRef: 'sub_live_demo_mandate_1yr',
        createdAt: periodStart,
      },
    ],
    reviewSessions: [],
    reviewRatings: [],
    generatedReviews: [],
    analyticsEvents: [],
    auditLogs: [
      {
        id: 'audit-001',
        action: 'PLATFORM_INITIALIZATION',
        actorId: ADMIN_ID,
        details: 'Platform initialized with single administrator and single sample business',
        timestamp: nowIso,
      },
    ],
    emailVerifications: [],
    systemNotifications: [
      {
        id: 'notif-001',
        recipientId: DEMO_ID,
        title: 'Welcome to KindlyRate',
        message: 'Your 1-Year Growth Pack is active. Smart QR stands are operational.',
        read: false,
        createdAt: periodStart,
      },
    ],
    customSoftwareInquiries: [],
    blogPosts: existingData.blogPosts || [],
    apiKeys: existingData.apiKeys || [],
    phoneVerifications: [],
    passwordResets: [],
  };

  // Seed 14 sample review sessions & analytics events for dashboard richness
  const sampleCustomerNames = [
    'Rohan Kulkarni', 'Sneha Patel', 'Ananya Iyer', 'Aditya Verma', 'Meera Rao',
    'Karthik Nambiar', 'Pooja Hegde', 'Nikhil Reddy', 'Shreya Banerjee', 'Tanvi Deshmukh',
    'Arjun Nair', 'Divya Soni', 'Rahul Kapoor', 'Ritu Saxena'
  ];

  const samplePositiveSnippets = [
    'The almond croissants and cortado were sensational! Super calm ambience to work from.',
    'Amazing specialty coffee roast. The barista recommended the pour-over which was exceptional.',
    'Warm service, great aesthetic, and delightful pastries. Indiranagar favorite without doubt.',
    'Crisp clean tables, fast service and wonderful sourdough toast. Highly recommended!',
    'Great vibe for meeting clients or casual weekend brunch. Will definitely be returning.',
  ];

  for (let i = 0; i < sampleCustomerNames.length; i++) {
    const isNegative = i === 3 || i === 9; // 2 intercepted private feedback sessions
    const rating = isNegative ? (i === 3 ? 2 : 3) : 5;
    const sessionId = `session-demo-${i + 1}`;
    const qrId = i % 2 === 0 ? 'qr-demo-001' : 'qr-demo-002';
    const daysAgo = Math.floor(i * 0.8) + 1;
    const sessionTime = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    cleanData.reviewSessions.push({
      id: sessionId,
      businessId: BIZ_ID,
      qrCodeId: qrId,
      overallRating: rating,
      customerName: sampleCustomerNames[i],
      customerPhone: `+9198${Math.floor(10000000 + Math.random() * 90000000)}`,
      customerFeedback: isNegative
        ? 'A bit too noisy during rush hour and took 20 mins for our iced latte.'
        : samplePositiveSnippets[i % samplePositiveSnippets.length],
      status: isNegative ? 'SHIELDED_PRIVATE' : 'POSTED_TO_GOOGLE',
      intercepted: isNegative,
      createdAt: sessionTime,
      updatedAt: sessionTime,
    });

    cleanData.analyticsEvents.push(
      {
        id: `event-scan-${i + 1}`,
        businessId: BIZ_ID,
        qrCodeId: qrId,
        eventType: 'QR_SCAN',
        timestamp: sessionTime,
      },
      {
        id: `event-rating-${i + 1}`,
        businessId: BIZ_ID,
        qrCodeId: qrId,
        eventType: 'RATING_SUBMITTED',
        timestamp: sessionTime,
      }
    );

    if (!isNegative) {
      cleanData.generatedReviews.push({
        id: `gen-review-${i + 1}`,
        sessionId,
        businessId: BIZ_ID,
        draftText: samplePositiveSnippets[i % samplePositiveSnippets.length],
        keywordsIncluded: ['specialty coffee', 'artisan pastries', 'Indiranagar', 'barista'],
        copiedToClipboard: true,
        createdAt: sessionTime,
      });
    }
  }

  return cleanData;
}

if (process.argv[1]?.endsWith('reset-to-two-accounts.js')) {
  const localJsonPath = path.resolve('./data/review_platform.json');
  const backendJsonPath = path.resolve('./backend/data/review_platform.json');

  let existing = {};
  if (fs.existsSync(localJsonPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(localJsonPath, 'utf8'));
    } catch {}
  }

  const clean = generateCleanPlatformData(existing);
  const jsonContent = JSON.stringify(clean, null, 2);

  fs.writeFileSync(localJsonPath, jsonContent, 'utf8');
  if (fs.existsSync(path.dirname(backendJsonPath))) {
    fs.writeFileSync(backendJsonPath, jsonContent, 'utf8');
  }

  console.log('✓ Successfully reset local JSON data store to EXACTLY TWO ACCOUNTS:');
  console.log('  1. Platform Administrator: admin@kindlyrate.com / AdminSecurePassword123!');
  console.log('  2. Sample Demo Merchant:   demo@kindlyrate.com  / DemoRate2026!');
  console.log(`  Users: ${clean.users.length}`);
  console.log(`  Businesses: ${clean.businesses.length} (${clean.businesses[0].name})`);
  console.log(`  Active QR Stands: ${clean.qrCodes.length}`);
  console.log(`  Sample Review Sessions: ${clean.reviewSessions.length}`);

  // Also sync to PostgreSQL if on server or pg is available
  try {
    const pg = await import(fs.existsSync('/var/www/kindlyreview/backend/node_modules/pg') ? '/var/www/kindlyreview/backend/node_modules/pg/lib/index.js' : 'pg').catch(() => null);
    if (pg && pg.default) {
      const { Pool } = pg.default;
      const dbUrl = process.env.DATABASE_URL || 'postgresql://kindlyreview_admin:SecureKindlyReview2026DbPass!@localhost:5432/kindlyreview_db';
      const pool = new Pool({ connectionString: dbUrl });
      const client = await pool.connect();
      try {
        await client.query(
          'UPDATE kindlyreview_store SET data = $1, updated_at = NOW() WHERE id = $2',
          [jsonContent, 'primary']
        );
        console.log('✓ Successfully synchronized 2-account clean state into PostgreSQL (kindlyreview_store)');
      } finally {
        client.release();
        await pool.end();
      }
    }
  } catch (pgErr) {
    console.log('Note: PostgreSQL sync skipped locally or will run on EC2 deployment:', pgErr.message);
  }
}
