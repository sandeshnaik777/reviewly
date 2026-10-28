import { db } from '../dist/db/index.js';
import bcrypt from 'bcryptjs';

async function check() {
  const u = await db.findUserByEmail('demo@kindlyrate.com');
  console.log('User found:', u ? {
    id: u.id,
    email: u.email,
    passwordHash: u.passwordHash,
    role: u.role,
    isActive: u.isActive,
    failedLoginAttempts: u.failedLoginAttempts,
    lockoutUntil: u.lockoutUntil
  } : 'NOT FOUND');
  if (u) {
    const match = bcrypt.compareSync('DemoRate2026!', u.passwordHash);
    console.log('bcrypt compareSync match:', match);
  }
  process.exit(0);
}
check().catch(console.error);

