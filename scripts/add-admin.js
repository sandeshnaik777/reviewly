import fs from 'fs';
import pg from 'pg';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const { Pool } = pg;
const databaseUrl = 'postgresql://kindlyreview_admin:SecureKindlyReview2026DbPass!@localhost:5432/kindlyreview_db';
const pool = new Pool({ connectionString: databaseUrl });

async function addAdmin() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT data FROM kindlyreview_store WHERE id = $1', ['primary']);
    if (res.rows.length === 0) {
      console.error('primary store row not found');
      return;
    }
    const data = res.rows[0].data;
    const adminEmail = 'admin@kindlyrate.com';
    const password = 'AdminSecurePassword123!';
    const passwordHash = bcrypt.hashSync(password, 10);

    let admin = data.users.find((u) => u.email.toLowerCase() === adminEmail);
    if (!admin) {
      admin = {
        id: crypto.randomUUID(),
        email: adminEmail,
        passwordHash,
        name: 'Platform Administrator',
        role: 'PLATFORM_ADMIN',
        isActive: true,
        emailVerified: true,
        failedLoginAttempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      data.users.push(admin);
      console.log('Added admin user:', adminEmail);
    } else {
      admin.passwordHash = passwordHash;
      admin.role = 'PLATFORM_ADMIN';
      admin.isActive = true;
      admin.failedLoginAttempts = 0;
      admin.lockoutUntil = null;
      console.log('Updated existing admin user:', adminEmail);
    }

    await client.query(
      'UPDATE kindlyreview_store SET data = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(data), 'primary']
    );
    console.log('Successfully updated PostgreSQL store with admin@kindlyrate.com');
  } finally {
    client.release();
    await pool.end();
  }
}

addAdmin().catch(console.error);

