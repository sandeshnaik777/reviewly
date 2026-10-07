import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { AppError } from './errorHandler.js';
import { db } from '../db/index.js';

/**
 * Resolves the target business/tenant from route params, query, or headers.
 * Strictly verifies that the authenticated user is either PLATFORM_ADMIN or has
 * legitimate ownership/membership in this tenant.
 * Prevents IDOR (Insecure Direct Object Reference).
 */
export async function requireTenant(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');
    }

    const rawBusinessId =
      req.params.businessId ||
      req.params.id ||
      req.headers['x-business-id'] ||
      (typeof req.query.businessId === 'string' ? req.query.businessId : undefined);

    const businessId = Array.isArray(rawBusinessId) ? rawBusinessId[0] : (rawBusinessId as string);

    if (!businessId) {
      throw new AppError('Tenant/Business identifier is required.', 400, 'BUSINESS_ID_REQUIRED');
    }

    const business = await db.findBusinessById(businessId);
    if (!business) {
      throw new AppError('Business not found.', 404, 'BUSINESS_NOT_FOUND');
    }

    // Platform Admins have overarching authority
    if (req.user.role === 'PLATFORM_ADMIN') {
      req.tenantId = business.id;
      req.tenantRole = 'PLATFORM_ADMIN';
      return next();
    }

    // Direct owner check
    if (business.ownerId === req.user.id) {
      req.tenantId = business.id;
      req.tenantRole = 'BUSINESS_OWNER';
      return next();
    }

    // Business member / staff check
    const memberRole = await db.getMemberRole(business.id, req.user.id);
    if (memberRole) {
      req.tenantId = business.id;
      req.tenantRole = memberRole;
      return next();
    }

    // Unauthorized access to another tenant's data
    throw new AppError('Access denied: You do not have permission to access this business.', 403, 'TENANT_ACCESS_DENIED');
  } catch (error) {
    next(error);
  }
}
