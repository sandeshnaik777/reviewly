import fs from 'fs';
import pg from 'pg';

const { Pool } = pg;
const databaseUrl = 'postgresql://kindlyreview_admin:SecureKindlyReview2026DbPass!@localhost:5432/kindlyreview_db';
const pool = new Pool({ connectionString: databaseUrl });

async function sync() {
  const jsonPath = '/var/www/kindlyreview/backend/data/review_platform.json';
  const content = fs.readFileSync(jsonPath, 'utf8');
  const parsed = JSON.parse(content);
  console.log('Parsed JSON successfully. Users in JSON:', parsed.users.length);

  const client = await pool.connect();
  try {
    const res = await client.query(
      'UPDATE kindlyreview_store SET data = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
      [JSON.stringify(parsed), 'primary']
    );
    console.log('Updated kindlyreview_store primary row:', res.rowCount);
  } finally {
    client.release();
    await pool.end();
  }
}

sync().catch(console.error);

