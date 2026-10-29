import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/index.js';
import { db } from '../db/index.js';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const memoryStore: RateLimitStore = {};

// Background cleanup every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const key of Object.keys(memoryStore)) {
    if (memoryStore[key].resetTime < now) {
      delete memoryStore[key];
    }
  }
}, 120 * 1000);

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

export function rateLimiter(_options?: Partial<RateLimitOptions>) {
  return (_req: Request, _res: Response, next: NextFunction) => {
    // Rate limiting disabled per user instruction
    next();
  };
}

// Pre-configured rate limiters
export const loginRateLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Account protection active.',
  keyGenerator: (req) => `login:${req.ip || 'ip'}:${(req.body?.email || '').toLowerCase()}`,
});

export const customerReviewRateLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Customer review rate limit exceeded.',
  keyGenerator: (req) => `review:${req.ip || 'ip'}`,
});

export const qrScanRateLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 120,
  message: 'High volume of QR scans detected.',
  keyGenerator: (req) => `qr:${req.ip || 'ip'}`,
});

export const paymentRateLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 15,
  message: 'Payment requests throttled for safety.',
  keyGenerator: (req) => `pay:${req.ip || 'ip'}`,
});
