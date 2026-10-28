import { db } from './backend/dist/db/index.js';
import bcrypt from 'bcryptjs';

async function test() {
  const email = 'demo@kindlyrate.com';
  const u = await db.findUserByEmail(email);
  console.log('db.filePath:', db.filePath);
  console.log('User found:', u ? u.email : 'NONE');
  if (u) {
    console.log('Password hash in DB:', u.passwordHash);
    console.log('Match DemoRate2026!?:', bcrypt.compareSync('DemoRate2026!', u.passwordHash));
  }
  process.exit(0);
}
test().catch(console.error);

