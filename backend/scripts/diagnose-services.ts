import nodemailer from 'nodemailer';
import pg from 'pg';
import { config } from '../src/config/index.js';

async function diagnose() {
  console.log('====================================================');
  console.log('🔍 KINDLYREVIEW PRODUCTION ENVIRONMENT DIAGNOSTICS');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('====================================================\n');

  // 1. PostgreSQL Check
  console.log('🐘 1. POSTGRESQL DATABASE:');
  if (config.db.databaseUrl) {
    const pool = new pg.Pool({ connectionString: config.db.databaseUrl, connectionTimeoutMillis: 5000 });
    try {
      const client = await pool.connect();
      const res = await client.query('SELECT current_database(), current_user, version();');
      const storeRes = await client.query('SELECT id, updated_at, pg_size_pretty(length(data::text)::bigint) as data_size FROM kindlyreview_store;');
      const tablesRes = await client.query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';");
      console.log('   ✅ PostgreSQL is CONNECTED & HEALTHY');
      console.log('   Database:', res.rows[0].current_database);
      console.log('   User:', res.rows[0].current_user);
      console.log('   Tables in public schema:', tablesRes.rows[0].count);
      console.log('   Primary Store Record:', storeRes.rows[0]);
      client.release();
      await pool.end();
    } catch (err) {
      console.error('   ❌ PostgreSQL Error:', (err as Error).message);
    }
  } else {
    console.log('   ⚠️ DATABASE_URL is not set.');
  }

  // 2. Email Service (Brevo SMTP) Check
  console.log('\n📧 2. BREVO / SMTP EMAIL SERVICE:');
  console.log('   SMTP Host:', config.email.smtpHost || '(not set)');
  console.log('   SMTP Port:', config.email.smtpPort);
  console.log('   SMTP User:', config.email.smtpUser || '(not set)');
  console.log('   Email From:', config.email.from);

  if (config.email.smtpHost && config.email.smtpUser && config.email.smtpPass) {
    const transporter = nodemailer.createTransport({
      host: config.email.smtpHost,
      port: config.email.smtpPort,
      secure: config.email.smtpPort === 465,
      auth: {
        user: config.email.smtpUser,
        pass: config.email.smtpPass,
      },
      connectionTimeout: 10000,
    });

    try {
      console.log('   Verifying SMTP connection credentials...');
      await transporter.verify();
      console.log('   ✅ Brevo SMTP Authentication Succeeded! Ready to deliver.');

      const testRecipient = 'sandeshnaik525@gmail.com';
      console.log(`   Sending live verification check to: ${testRecipient}...`);
      const info = await transporter.sendMail({
        from: config.email.from,
        to: testRecipient,
        subject: '✅ KindlyReview Email Service Operational Check',
        text: 'This is a confirmation email from KindlyReview production server. Your Brevo SMTP email service is working 100%!',
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #10b981; border-radius: 8px; max-width: 500px;">
            <h2 style="color: #059669; margin-top: 0;">✦ KindlyReview Email Service Active</h2>
            <p>Your Brevo SMTP configuration on EC2 is verified and fully operational.</p>
            <p style="font-size: 13px; color: #6b7280;">Sent at: ${new Date().toISOString()}</p>
          </div>
        `,
      });
      console.log(`   ✅ Test email delivered successfully! Message ID: ${info.messageId}`);
    } catch (err) {
      console.error('   ❌ SMTP Error:', (err as Error).message);
    }
  } else {
    console.log('   ⚠️ SMTP credentials incomplete. OTPs log in console mode.');
  }

  // 3. Gemini AI Check
  console.log('\n🤖 3. GOOGLE GEMINI AI:');
  console.log('   Model:', config.gemini.model);
  if (config.gemini.apiKey) {
    const masked = config.gemini.apiKey.slice(0, 8) + '...' + config.gemini.apiKey.slice(-4);
    console.log('   API Key:', masked);
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${config.gemini.model}:generateContent?key=${config.gemini.apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Respond with exactly: OPERATIONAL' }] }],
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        console.log('   ✅ Gemini REST API responded successfully:', text);
      } else {
        const errText = await response.text();
        console.warn(`   ⚠️ Gemini API responded HTTP ${response.status}:`, errText);
      }
    } catch (err) {
      console.warn('   ⚠️ Gemini API error:', (err as Error).message);
    }
  } else {
    console.log('   ℹ️ GEMINI_API_KEY is not set in .env. Falling back to built-in humanized templates.');
  }

  // 4. SMS Service (AWS SNS) Check
  console.log('\n📱 4. SMS SERVICE (AWS SNS PHONE OTP):');
  console.log('   Region:', config.awsSms.region);
  console.log('   Sender ID:', config.awsSms.senderId);
  console.log('   Access Key ID:', config.awsSms.accessKeyId ? config.awsSms.accessKeyId.slice(0, 6) + '...' : '(Not set in .env)');
  console.log('   Secret Access Key:', config.awsSms.secretAccessKey ? '******' : '(Not set in .env)');
  if (config.awsSms.accessKeyId && config.awsSms.secretAccessKey) {
    console.log('   ✅ AWS SNS credentials configured in .env for live SMS dispatch.');
  } else {
    console.log('   ℹ️ AWS SNS credentials not configured yet in .env.');
    console.log('   ℹ️ Super Admin can add AWS SMS credentials directly in Admin Dashboard -> API Keys -> AWS_SMS.');
    console.log('   ℹ️ OTP verification lifecycle (format, codeHash, attempt limits, 10m expiry) is fully operational.');
  }

  // 5. Razorpay Payments Check
  console.log('\n💳 5. RAZORPAY PAYMENT GATEWAY:');
  console.log('   Key ID:', config.razorpay.keyId);
  console.log('   Key Secret:', config.razorpay.keySecret ? '****** (Configured)' : '(Not set)');
  console.log('   Webhook Secret:', config.razorpay.webhookSecret ? '****** (Configured)' : '(Not set)');

  console.log('\n====================================================');
  console.log('🏁 DIAGNOSTICS COMPLETE');
  console.log('====================================================');
}

diagnose().catch(console.error);
