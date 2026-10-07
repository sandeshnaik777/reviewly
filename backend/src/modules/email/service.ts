import nodemailer from 'nodemailer';
import { config } from '../../config/index.js';

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  devMode?: boolean;
}

export class EmailService {
  private transporter: any = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    if (config.email.smtpHost && config.email.smtpUser && config.email.smtpPass) {
      try {
        this.transporter = nodemailer.createTransport({
          host: config.email.smtpHost,
          port: config.email.smtpPort,
          secure: config.email.smtpPort === 465,
          auth: {
            user: config.email.smtpUser,
            pass: config.email.smtpPass,
          },
        });
        console.log(`[EmailService] Configured SMTP via ${config.email.smtpHost}:${config.email.smtpPort}`);
      } catch (err) {
        console.warn('[EmailService] Failed to initialize SMTP transporter:', err);
        this.transporter = null;
      }
    }
  }

  /**
   * Dispatches a 6-digit email verification code.
   * If real SMTP credentials are provided, delivers via email.
   * In local development without SMTP, logs prominently to the console so local testing is seamless.
   */
  async sendVerificationOtp(email: string, otp: string, recipientName?: string): Promise<EmailSendResult> {
    const greeting = recipientName ? `Hello ${recipientName},` : 'Hello,';
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fcfbf9; margin: 0; padding: 24px; color: #1c1917; }
    .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid #e7e5e4; padding: 36px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .brand { font-size: 22px; font-weight: 800; color: #9a4018; margin-bottom: 24px; letter-spacing: -0.5px; }
    .title { font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #1c1917; }
    .text { font-size: 15px; line-height: 1.6; color: #57534e; margin-bottom: 24px; }
    .otp-box { background: #faf8f5; border: 2px dashed #9a4018; border-radius: 12px; padding: 20px; text-align: center; margin: 28px 0; }
    .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #9a4018; font-family: monospace; }
    .expiry { font-size: 13px; color: #78716c; margin-top: 8px; }
    .footer { font-size: 12px; color: #a8a29e; text-align: center; margin-top: 32px; border-top: 1px solid #f5f5f4; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">✦ Reviewly</div>
    <div class="title">Verify Your Email Address</div>
    <p class="text">${greeting}<br>Welcome to Reviewly! Enter the 6-digit verification code below to confirm your email and activate your account:</p>
    
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <div class="expiry">⏱ Valid for 10 minutes (Single use)</div>
    </div>

    <p class="text" style="font-size: 13.5px; margin-bottom: 0;">
      If you did not request this verification code, you can safely ignore this email. Your account remains secure.
    </p>

    <div class="footer">
      Reviewly Reputation Engine · Multi-Tenant 5-Star Reviews Platform<br>
      Automated verification system. Please do not reply directly to this email.
    </div>
  </div>
</body>
</html>
    `;

    const textContent = `${greeting}\n\nYour Reviewly email verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`;

    // 1. Try sending via configured SMTP
    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: config.email.from,
          to: email,
          subject: `${otp} is your Reviewly Verification Code`,
          text: textContent,
          html: htmlContent,
        });
        console.log(`[EmailService] Sent verification email to ${email} (Message ID: ${info.messageId})`);
        return { success: true, messageId: info.messageId, devMode: false };
      } catch (sendErr) {
        console.warn(`[EmailService] SMTP delivery to ${email} failed:`, sendErr);
        // Fallback to dev output below
      }
    }

    // 2. Development / Local Fallback Console Display
    console.log('\n' + '='.repeat(64));
    console.log('📧  [REVIEWLY EMAIL SERVICE — VERIFICATION CODE]');
    console.log(`    Recipient: ${email}`);
    if (recipientName) console.log(`    Name:      ${recipientName}`);
    console.log(`    CODE:      [ ${otp.split('').join(' ')} ]`);
    console.log('    Expires:   10 minutes');
    console.log('='.repeat(64) + '\n');

    return { success: true, devMode: true };
  }
}

export const emailService = new EmailService();
