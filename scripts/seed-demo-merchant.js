import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const possiblePaths = [
  '/var/www/kindlyreview/data/review_platform.json',
  '/var/www/kindlyreview/backend/data/review_platform.json',
  path.resolve('backend/data/review_platform.json'),
  path.resolve('data/review_platform.json')
];

for (const dbPath of possiblePaths) {
  if (!fs.existsSync(dbPath)) continue;

  const raw = fs.readFileSync(dbPath, 'utf8');
  const data = JSON.parse(raw);

  const DEMO_EMAIL = 'demo@kindlyrate.com';
  const DEMO_PASS = 'DemoRate2026!';
  const passwordHash = bcrypt.hashSync(DEMO_PASS, 10);

  let user = data.users.find((u) => u.email.toLowerCase() === DEMO_EMAIL.toLowerCase());

  if (!user) {
    user = {
      id: crypto.randomUUID(),
      email: DEMO_EMAIL,
      passwordHash,
      name: 'KindlyRate Demo Merchant',
      role: 'BUSINESS_OWNER',
      isActive: true,
      emailVerified: true,
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.users.push(user);
    console.log('Created user:', DEMO_EMAIL, 'in', dbPath);
  } else {
    user.passwordHash = passwordHash;
    user.emailVerified = true;
    user.isActive = true;
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    console.log('Updated user password for:', DEMO_EMAIL, 'in', dbPath);
  }

  let business = data.businesses.find((b) => b.ownerId === user.id);
  if (!business) {
    const businessId = crypto.randomUUID();
    business = {
      id: businessId,
      ownerId: user.id,
      name: 'KindlyRate Demo Store',
      slug: 'kindlyrate-demo-store',
      mainCategory: 'FOOD & HOSPITALITY',
      subcategory: 'Cafe & Bistro',
      phone: '+919876543210',
      email: DEMO_EMAIL,
      address: '100 Feet Road, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      pincode: '560038',
      googleReviewUrl: 'https://maps.google.com/?cid=12345678901234567890',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.businesses.push(business);

    // Business Member
    data.businessMembers.push({
      id: crypto.randomUUID(),
      businessId,
      userId: user.id,
      role: 'BUSINESS_OWNER',
      permissions: ['ALL'],
      createdAt: new Date().toISOString(),
    });

    // Business Settings
    data.businessSettings.push({
      id: crypto.randomUUID(),
      businessId,
      minGoogleStars: 4,
      negativeFeedbackDestination: 'BOTH',
      negativeFeedbackPhone: '+919876543210',
      negativeFeedbackEmail: DEMO_EMAIL,
      reputationShieldEnabled: true,
      incentiveEnabled: false,
      googleReviewUrl: 'https://maps.google.com/?cid=12345678901234567890',
      primaryColor: '#00383b',
      welcomeMessage: 'Thank you for visiting KindlyRate Demo Store! We appreciate your honest feedback.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Business Questions
    data.businessQuestions.push(
      {
        id: crypto.randomUUID(),
        businessId,
        questionKey: 'food_quality',
        label: 'How was the food and drink quality?',
        scaleType: '1-5_STARS',
        minValue: 1,
        maxValue: 5,
        weight: 1.0,
        isRequired: true,
        displayOrder: 1,
        createdAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        businessId,
        questionKey: 'service_speed',
        label: 'How was the speed and attentiveness of our team?',
        scaleType: '1-5_STARS',
        minValue: 1,
        maxValue: 5,
        weight: 1.0,
        isRequired: true,
        displayOrder: 2,
        createdAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        businessId,
        questionKey: 'ambience_cleanliness',
        label: 'How would you rate the ambience and cleanliness?',
        scaleType: '1-5_STARS',
        minValue: 1,
        maxValue: 5,
        weight: 1.0,
        isRequired: true,
        displayOrder: 3,
        createdAt: new Date().toISOString(),
      }
    );

    // QR Code
    data.qrCodes.push({
      id: crypto.randomUUID(),
      businessId,
      identifier: 'counter-main',
      locationName: 'Billing Counter Main',
      qrType: 'TABLE_STAND',
      targetUrl: 'https://kindlyrate.com/r/kindlyrate-demo-store?qr=counter-main',
      scansCount: 42,
      uniqueVisitorsCount: 38,
      reviewsStartedCount: 29,
      reviewsCompletedCount: 26,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Starter subscription
    data.subscriptions.push({
      id: crypto.randomUUID(),
      businessId,
      planId: 'starter',
      status: 'ACTIVE',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reviewLimitMonthly: 100,
      reviewsGeneratedThisMonth: 12,
      qrCodeLimit: 2,
      qrCodesActive: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log('Created demo business and assets for:', business.name, 'in', dbPath);
  }

  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Successfully saved to:', dbPath);
}
