import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';
import { requireTenant } from '../../middleware/tenant.js';
import { validateBody } from '../../middleware/validate.js';
import { qrService } from './service.js';
import { AppError } from '../../middleware/errorHandler.js';

export const qrRouter = Router();

// Tenant Protected: List all QR codes for a business
qrRouter.get('/business/:businessId/qrs', authenticate, requireTenant, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const qrs = await db.listQRCodes(req.tenantId!);
    res.json({ success: true, data: qrs });
  } catch (err) {
    next(err);
  }
});

// Tenant Protected: Create new QR code
qrRouter.post(
  '/business/:businessId/qrs',
  authenticate,
  requireTenant,
  validateBody(
    z.object({
      name: z.string().min(1, 'QR code name is required'),
      locationTag: z.string().default('Counter'),
    })
  ),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const qr = await qrService.createQRCode(req.tenantId!, req.body.name, req.body.locationTag);
      res.status(201).json({ success: true, data: qr });
    } catch (err) {
      next(err);
    }
  }
);

// Public / Authenticated: Get QR image SVG/PNG data
qrRouter.get('/:slug/image', async (req, res, next) => {
  try {
    const slug = req.params.slug as string;
    const format = (req.query.format as string) || 'svg';
    const qr = await db.findQRCodeBySlug(slug);

    if (!qr || !qr.isActive) {
      throw new AppError('QR Code not found or inactive', 404, 'QR_NOT_FOUND');
    }

    if (format === 'png') {
      const dataUrl = await qrService.getQRImageDataUrl(slug);
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      const imgBuffer = Buffer.from(base64Data, 'base64');
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="qr-${slug}.png"`);
      return res.send(imgBuffer);
    }

    const svg = await qrService.getQRImageSvg(slug);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (err) {
    next(err);
  }
});

// Tenant Protected: Toggle active or update QR code
qrRouter.patch(
  '/business/:businessId/qrs/:id',
  authenticate,
  requireTenant,
  validateBody(
    z.object({
      name: z.string().optional(),
      locationTag: z.string().optional(),
      isActive: z.boolean().optional(),
    })
  ),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const updated = await db.updateQRCode(req.params.id as string, req.tenantId!, req.body);
      if (!updated) {
        throw new AppError('QR Code not found', 404, 'NOT_FOUND');
      }
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
);
