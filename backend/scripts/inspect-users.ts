import dotenv from 'dotenv';
dotenv.config();
import { db } from '../src/db/index.js';

async function main() {
  await new Promise((r) => setTimeout(r, 2000));
  const raw = (db as any).data;
  const users = raw.users || [];
  console.log(`\n========================================`);
  console.log(`TOTAL USERS IN SYSTEM (${users.length}):`);
  console.log(`========================================`);
  users.forEach((u: any, i: number) => {
    console.log(`${i + 1}. [${u.id}] ${u.email} | ${u.name} | Verified: ${u.emailVerified} | GoogleId: ${u.googleId || 'no'} | Created: ${u.createdAt}`);
  });

  const businesses = raw.businesses || [];
  console.log(`\n========================================`);
  console.log(`TOTAL BUSINESSES (${businesses.length}):`);
  console.log(`========================================`);
  businesses.forEach((b: any, i: number) => {
    console.log(`${i + 1}. [${b.id}] ${b.name} (${b.slug}) | Owner: ${b.ownerId} | Created: ${b.createdAt}`);
  });
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
