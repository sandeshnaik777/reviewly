import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { AppError } from './errorHandler.js';
import { UserRole } from '../types/index.js';

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          'Access forbidden. You do not have permission to access this resource.',
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
}

export const requireAdmin = requireRole('PLATFORM_ADMIN');
export const requireBusinessOwner = requireRole('PLATFORM_ADMIN', 'BUSINESS_OWNER');
