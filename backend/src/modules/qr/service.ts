import crypto from 'crypto';
import QRCode from 'qrcode';
import { db } from '../../db/index.js';
import { config } from '../../config/index.js';
import { QRCodeItem } from '../../types/index.js';
import { AppError } from '../../middleware/errorHandler.js';

export class QRService {
  /**
   * Generates a collision-resistant, URL-safe random slug
   */
  private generateSlug(): string {
    return crypto.randomBytes(6).toString('base64url');
  }

  async createQRCode(businessId: string, name: string, locationTag: string = 'Counter'): Promise<QRCodeItem> {
    // Check business QR code limit from subscription
    const sub = await db.getBusinessSubscription(businessId);
    const plan = sub ? await db.findPlanById(sub.planId) : undefined;
    const existingQRs = await db.listQRCodes(businessId);

    const limit = plan?.qrCodeLimit || 1;
    if (existingQRs.length >= limit) {
      throw new AppError(
        `QR code limit (${limit}) reached for your current plan. Please upgrade to create more.`,
        403,
        'QR_LIMIT_REACHED'
      );
    }

    const qr: QRCodeItem = {
      id: crypto.randomUUID(),
      businessId,
      slug: this.generateSlug(),
      name,
      locationTag,
      isActive: true,
      scanCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return db.createQRCode(qr);
  }

  async getQRImageSvg(slug: string): Promise<string> {
    const targetUrl = `${config.appUrl}/r/${slug}`;
    return QRCode.toString(targetUrl, {
      type: 'svg',
      margin: 2,
      color: {
        dark: '#9a4018', // Stitch terracotta primary brand color
        light: '#ffffff',
      },
    });
  }

  async getQRImageDataUrl(slug: string): Promise<string> {
    const targetUrl = `${config.appUrl}/r/${slug}`;
    return QRCode.toDataURL(targetUrl, {
      margin: 2,
      width: 400,
      color: {
        dark: '#9a4018',
        light: '#ffffff',
      },
    });
  }
}

export const qrService = new QRService();
