import { db } from '../dist/db/index.js';

async function main() {
  console.log('db.filePath:', db.filePath);
  const u = await db.findUserByEmail('demo@kindlyrate.com');
  console.log('demo user:', u ? u.email : 'NOT FOUND');
  const allUsers = (await db.getAllUsers ? await db.getAllUsers() : db.data.users) || [];
  console.log('All user emails in db:', allUsers.map((x) => x.email));
  process.exit(0);
}
main().catch(console.error);

