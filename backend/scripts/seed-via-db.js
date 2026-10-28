import { db } from '../dist/db/index.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

async function seedDemo() {
  const DEMO_EMAIL = 'demo@kindlyrate.com';
  const DEMO_PASS = 'DemoRate2026!';
  const passwordHash = bcrypt.hashSync(DEMO_PASS, 10);

  let user = await db.findUserByEmail(DEMO_EMAIL);
  if (!user) {
    const userId = crypto.randomUUID();
    user = await db.createUser({
      id: userId,
      email: DEMO_EMAIL,
      passwordHash,
      name: 'KindlyRate Demo Merchant',
      role: 'BUSINESS_OWNER',
      isActive: true,
      emailVerified: true,
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log('Created user via db.createUser:', user.email);
  } else {
    user = await db.updateUser(user.id, {
      passwordHash,
      emailVerified: true,
      isActive: true,
      failedLoginAttempts: 0,
      lockoutUntil: undefined,
    });
    console.log('Updated user via db.updateUser:', user?.email);
  }

  const businesses = await db.findBusinessesByOwnerId(user.id);
  if (!businesses || businesses.length === 0) {
    const businessId = crypto.randomUUID();
    const business = await db.createBusiness({
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
    });

    await db.addBusinessMember({
      id: crypto.randomUUID(),
      businessId,
      userId: user.id,
      role: 'BUSINESS_OWNER',
      permissions: ['ALL'],
      createdAt: new Date().toISOString(),
    });

    await db.saveBusinessSettings({
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

    await db.createOrUpdateSubscription({
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

    console.log('Created business and subscription for demo merchant:', business.name);
  } else {
    console.log('Business already exists for demo user:', businesses[0].name);
  }

  process.exit(0);
}

seedDemo().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
