const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(raw) }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('--- 1. Testing Phone OTP Dispatch ---');
  const phoneRes = await post('/api/auth/send-phone-otp', { phone: '9876543210' });
  console.log('Phone OTP Response:', phoneRes);

  console.log('\n--- 2. Testing Invalid Code Verification (Security Check) ---');
  const invalidRes = await post('/api/auth/verify-phone-otp', { phone: '9876543210', otp: '000000' });
  console.log('Invalid Code Response (should reject):', invalidRes);
}

run().catch(console.error);
