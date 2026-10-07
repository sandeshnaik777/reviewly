import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { db } from '../db/index.js';
import { AppError } from './errorHandler.js';
import { User } from '../types/index.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
  tenantId?: string;
  tenantRole?: string;
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    // Check HTTP-only cookie first (preferred)
    if (req.cookies && req.cookies[config.jwt.cookieName]) {
      token = req.cookies[config.jwt.cookieName];
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Authentication required. Please log in.', 401, 'UNAUTHORIZED');
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (jwtErr: any) {
      if (jwtErr.name === 'TokenExpiredError') {
        throw new AppError('Session has expired. Please log in again.', 401, 'TOKEN_EXPIRED');
      }
      throw new AppError('Invalid authentication token.', 401, 'INVALID_TOKEN');
    }

    const user = await db.findUserById(decoded.userId);
    if (!user) {
      throw new AppError('User account not found.', 401, 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated. Please contact support.', 403, 'ACCOUNT_DEACTIVATED');
    }

    // Check account lockout
    if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
      const waitMinutes = Math.ceil((new Date(user.lockoutUntil).getTime() - Date.now()) / (60 * 1000));
      throw new AppError(`Account is temporarily locked. Try again in ${waitMinutes} minutes.`, 403, 'ACCOUNT_LOCKED');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
