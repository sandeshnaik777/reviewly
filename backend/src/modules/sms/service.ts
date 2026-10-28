import { SNSClient, PublishCommand, GetSMSAttributesCommand } from '@aws-sdk/client-sns';
import { config } from '../../config/index.js';
import { db } from '../../db/index.js';

export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  mode: 'aws_sns' | 'console';
  phone: string;
  error?: string;
}

export class AwsSmsService {
  private snsClient: SNSClient | null = null;
  private clientConfigKey = '';

  /**
   * Dynamically retrieves or instantiates the AWS SNS Client.
   * Priority:
   * 1. Active AWS_SMS key in the database API Keys pool (configurable by Super Admin in UI)
   * 2. Environment variables from config.awsSms
   */
  private async getSnsClient(): Promise<{ client: SNSClient; senderId?: string } | null> {
    try {
      // 1. Check Super Admin Database API keys pool
      const activeAwsKeys = await db.getActiveApiKeys('AWS_SMS');
      if (activeAwsKeys.length > 0) {
        const keyRecord = activeAwsKeys[0];
        // Expected format: "ACCESS_KEY_ID:SECRET_ACCESS_KEY" or JSON in keyValue
        let accessKeyId = '';
        let secretAccessKey = '';
        let region = keyRecord.secondaryValue?.split('|')[0]?.trim() || config.awsSms.region;
        const senderId = keyRecord.secondaryValue?.split('|')[1]?.trim() || config.awsSms.senderId;

        if (keyRecord.keyValue.includes(':')) {
          const parts = keyRecord.keyValue.split(':');
          accessKeyId = parts[0].trim();
          secretAccessKey = parts[1].trim();
        } else if (keyRecord.keyValue.startsWith('{')) {
          try {
            const parsed = JSON.parse(keyRecord.keyValue);
            accessKeyId = parsed.accessKeyId || parsed.key;
            secretAccessKey = parsed.secretAccessKey || parsed.secret;
            if (parsed.region) region = parsed.region;
          } catch {}
        }

        if (accessKeyId && secretAccessKey) {
          const cacheKey = `${accessKeyId}:${region}`;
          if (!this.snsClient || this.clientConfigKey !== cacheKey) {
            this.snsClient = new SNSClient({
              region,
              credentials: { accessKeyId, secretAccessKey },
            });
            this.clientConfigKey = cacheKey;
          }
          return { client: this.snsClient, senderId };
        }
      }

      // 2. Check environment variables
      if (config.awsSms.accessKeyId && config.awsSms.secretAccessKey) {
        const cacheKey = `${config.awsSms.accessKeyId}:${config.awsSms.region}`;
        if (!this.snsClient || this.clientConfigKey !== cacheKey) {
          this.snsClient = new SNSClient({
            region: config.awsSms.region,
            credentials: {
              accessKeyId: config.awsSms.accessKeyId,
              secretAccessKey: config.awsSms.secretAccessKey,
            },
          });
          this.clientConfigKey = cacheKey;
        }
        return { client: this.snsClient, senderId: config.awsSms.senderId };
      }

      return null;
    } catch (err) {
      console.error('[AwsSmsService] Failed to initialize SNS client:', err);
      return null;
    }
  }

  /**
   * Converts raw phone input to E.164 international format (+919876543210).
   */
  public formatE164(phone: string): string {
    const cleaned = phone.trim().replace(/[\s\-()]/g, '');
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    // Check if 10-digit Indian mobile number
    if (/^[6-9]\d{9}$/.test(cleaned)) {
      return `+91${cleaned}`;
    }
    // Check if 12-digit starting with 91
    if (/^91[6-9]\d{9}$/.test(cleaned)) {
      return `+${cleaned}`;
    }
    // Default prefix +
    return `+${cleaned}`;
  }

  /**
   * Dispatches a 6-digit verification OTP code via AWS SNS SMS.
   * If AWS credentials are not configured or in development mode, logs the OTP clearly to the terminal.
   */
  async sendPhoneOtp(phone: string, otp: string, recipientName?: string): Promise<SmsSendResult> {
    const e164Phone = this.formatE164(phone);
    const greeting = recipientName ? `Hello ${recipientName}, ` : '';
    const message = `${greeting}Your KindlyRate verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;

    const snsSetup = await this.getSnsClient();

    if (snsSetup && snsSetup.client) {
      try {
        const attributes: Record<string, { DataType: string; StringValue: string }> = {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional', // Transactional priority for OTPs
          },
        };

        if (snsSetup.senderId) {
          attributes['AWS.SNS.SMS.SenderID'] = {
            DataType: 'String',
            StringValue: snsSetup.senderId.slice(0, 11),
          };
        }

        // DLT Compliance attributes for India (TRAI Telecom requirement)
        if (config.awsSms.entityId) {
          attributes['AWS.MM.SMS.EntityId'] = {
            DataType: 'String',
            StringValue: config.awsSms.entityId,
          };
        }
        if (config.awsSms.templateId) {
          attributes['AWS.MM.SMS.TemplateId'] = {
            DataType: 'String',
            StringValue: config.awsSms.templateId,
          };
        }

        const command = new PublishCommand({
          PhoneNumber: e164Phone,
          Message: message,
          MessageAttributes: attributes,
        });

        const response = await snsSetup.client.send(command);
        console.log(`[AwsSmsService] ✓ OTP SMS sent via AWS SNS to ${e164Phone} (MessageId: ${response.MessageId})`);

        return {
          success: true,
          messageId: response.MessageId,
          mode: 'aws_sns',
          phone: e164Phone,
        };
      } catch (err: any) {
        console.error(`[AwsSmsService] ✕ AWS SNS SMS delivery failed for ${e164Phone}:`, err.message);

        // Fall back to dev console output so onboarding is never blocked
        this.printConsoleOtp(e164Phone, otp);
        return {
          success: true,
          mode: 'console',
          phone: e164Phone,
          error: `AWS SNS failed (${err.message}). Displayed in console.`,
        };
      }
    }

    // Console / Development Fallback when AWS keys are not yet configured
    this.printConsoleOtp(e164Phone, otp);
    return {
      success: true,
      mode: 'console',
      phone: e164Phone,
      messageId: `dev-sms-${Date.now()}`,
    };
  }

  /**
   * Tests AWS SNS connection with given credentials
   */
  async testCredentials(accessKeyId: string, secretAccessKey: string, region = 'ap-south-1'): Promise<{ valid: boolean; message: string; latencyMs: number }> {
    const startTime = Date.now();
    try {
      const client = new SNSClient({
        region,
        credentials: { accessKeyId, secretAccessKey },
      });
      const cmd = new GetSMSAttributesCommand({});
      await client.send(cmd);
      const latencyMs = Date.now() - startTime;
      return {
        valid: true,
        message: `AWS SNS connection verified in ${latencyMs}ms (Region: ${region})`,
        latencyMs,
      };
    } catch (err: any) {
      return {
        valid: false,
        message: `AWS SNS authentication failed: ${err.message}`,
        latencyMs: Date.now() - startTime,
      };
    }
  }

  private printConsoleOtp(phone: string, otp: string) {
    console.log('\n=============================================================');
    console.log('[AWS SNS SMS DISPATCH - OTP VERIFICATION]');
    console.log(`    RECIPIENT: ${phone}`);
    console.log(`    OTP CODE:  [ ${otp.split('').join(' ')} ]`);
    console.log('    STATUS:    VALID FOR 10 MINUTES (Transactional OTP)');
    console.log('=============================================================\n');
  }
}

export const smsService = new AwsSmsService();
