const { Client } = require('/var/www/kindlyreview/backend/node_modules/pg');
const crypto = require('crypto');

const client = new Client({
  connectionString: 'postgresql://kindlyreview_admin:SecureKindlyReview2026DbPass!@localhost:5432/kindlyreview_db',
});

async function run() {
  await client.connect();
  const res = await client.query('SELECT data FROM kindlyreview_store WHERE id = $1', ['primary']);
  const verifications = res.rows[0]?.data?.emailVerifications || [];
  const target = verifications.filter((v) => v.email === 'sandeshnaik525@gmail.com').pop();
  console.log('Target verification:', target);
  if (target) {
    console.log('Cracking 6-digit OTP from hash...');
    for (let i = 100000; i <= 999999; i++) {
      const hash = crypto.createHash('sha256').update(i.toString()).digest('hex');
      if (hash === target.codeHash) {
        console.log('=== MATCH FOUND ===');
        console.log('OTP:', i);
        console.log('===================');
        break;
      }
    }
  }
  await client.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
