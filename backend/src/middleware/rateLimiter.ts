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

export function rateLimiter(options: RateLimitOptions) {
  const { windowMs, max, message = 'Too many requests. Please try again later.' } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = options.keyGenerator
      ? options.keyGenerator(req)
      : `${req.ip || 'anonymous'}:${req.baseUrl || req.path}`;

    const now = Date.now();
    const entry = memoryStore[key];

    if (!entry || entry.resetTime < now) {
      memoryStore[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - 1);
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));
      return next();
    }

    if (entry.count >= max) {
      try { db.recordRateLimitHit(); } catch {}
      const retryAfterSeconds = Math.ceil((entry.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));

      const response: ApiResponse = {
        success: false,
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: `${message} Retry after ${retryAfterSeconds} seconds.`,
        },
      };
      return res.status(429).json(response);
    }

    entry.count += 1;
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));
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
