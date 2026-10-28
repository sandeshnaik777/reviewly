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
    <div class="brand">✦ KindlyRate</div>
    <div class="title">Verify Your Email Address</div>
    <p class="text">${greeting}<br>Welcome to KindlyRate! Enter the 6-digit verification code below to confirm your email and activate your account:</p>
    
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <div class="expiry">⏱ Valid for 10 minutes (Single use)</div>
    </div>

    <p class="text" style="font-size: 13.5px; margin-bottom: 0;">
      If you did not request this verification code, you can safely ignore this email. Your account remains secure.
    </p>

    <div class="footer">
      KindlyRate Reputation Engine · Multi-Tenant 5-Star Reviews Platform<br>
      Automated verification system. Please do not reply directly to this email.
    </div>
  </div>
</body>
</html>
    `;

    const textContent = `${greeting}\n\nYour KindlyRate email verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`;

    // 1. Try sending via configured SMTP
    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: config.email.from,
          to: email,
          subject: `${otp} is your KindlyRate Verification Code`,
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
    console.log('📧  [KINDLYRATE EMAIL SERVICE — VERIFICATION CODE]');
    console.log(`    Recipient: ${email}`);
    if (recipientName) console.log(`    Name:      ${recipientName}`);
    console.log(`    CODE:      [ ${otp.split('').join(' ')} ]`);
    console.log('    Expires:   10 minutes');
    console.log('='.repeat(64) + '\n');

    return { success: true, devMode: true };
  }

  /**
   * Dispatches a password reset email with a 6-digit code and direct 1-click reset link.
   */
  async sendPasswordResetEmail(
    email: string,
    otp: string,
    resetLink?: string,
    recipientName?: string
  ): Promise<EmailSendResult> {
    const greeting = recipientName ? `Hello ${recipientName},` : 'Hello,';
    const actionButton = resetLink
      ? `
      <div style="text-align: center; margin: 24px 0;">
        <a href="${resetLink}" style="background-color: #00383B; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block;">
          Reset Password Now &rarr;
        </a>
      </div>
      <p style="font-size: 13px; color: #78716c; text-align: center;">Or copy and paste this direct link into your browser:<br><a href="${resetLink}" style="color: #008F79; word-break: break-all;">${resetLink}</a></p>
      `
      : '';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fcfbf9; margin: 0; padding: 24px; color: #1c1917; }
    .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid #e7e5e4; padding: 36px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .brand { font-size: 22px; font-weight: 800; color: #00383B; margin-bottom: 24px; letter-spacing: -0.5px; }
    .title { font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #1c1917; }
    .text { font-size: 15px; line-height: 1.6; color: #57534e; margin-bottom: 24px; }
    .otp-box { background: #faf8f5; border: 2px dashed #008F79; border-radius: 12px; padding: 20px; text-align: center; margin: 28px 0; }
    .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #00383B; font-family: monospace; }
    .expiry { font-size: 13px; color: #78716c; margin-top: 8px; }
    .footer { font-size: 12px; color: #a8a29e; text-align: center; margin-top: 32px; border-top: 1px solid #f5f5f4; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">✦ KindlyRate</div>
    <div class="title">Reset Your Account Password</div>
    <p class="text">${greeting}<br>We received a request to reset the password for your KindlyRate account (<strong>${email}</strong>). Enter the 6-digit code below to set a new password:</p>
    
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <div class="expiry">Valid for 15 minutes (Single use)</div>
    </div>

    ${actionButton}

    <p class="text" style="font-size: 13px; color: #78716c; margin-top: 20px; border-top: 1px solid #f5f5f4; padding-top: 16px;">
      If you did not request a password reset, please ignore this email. Your password will remain unchanged and your account is completely secure.
    </p>

    <div class="footer">
      KindlyRate Security Team &middot; Multi-Tenant 5-Star Reviews Platform<br>
      Automated account security service. Please do not reply directly to this email.
    </div>
  </div>
</body>
</html>
    `;

    const textContent = `${greeting}\n\nWe received a request to reset your KindlyRate password.\n\nYour 6-digit reset code is: ${otp}\n\n${resetLink ? `Or reset directly using this link:\n${resetLink}\n\n` : ''}This code will expire in 15 minutes.\n\nIf you did not request this, please ignore this email.`;

    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: config.email.from,
          to: email,
          subject: `${otp} is your KindlyRate Password Reset Code`,
          text: textContent,
          html: htmlContent,
        });
        console.log(`[EmailService] Sent password reset email to ${email} (Message ID: ${info.messageId})`);
        return { success: true, messageId: info.messageId, devMode: false };
      } catch (sendErr) {
        console.warn(`[EmailService] SMTP delivery to ${email} failed:`, sendErr);
      }
    }

    console.log('\n' + '='.repeat(64));
    console.log('🔑  [KINDLYRATE EMAIL SERVICE — PASSWORD RESET]');
    console.log(`    Recipient: ${email}`);
    if (recipientName) console.log(`    Name:      ${recipientName}`);
    console.log(`    CODE:      [ ${otp.split('').join(' ')} ]`);
    if (resetLink) console.log(`    LINK:      ${resetLink}`);
    console.log('    Expires:   15 minutes');
    console.log('='.repeat(64) + '\n');

    return { success: true, devMode: true };
  }
}

export const emailService = new EmailService();
