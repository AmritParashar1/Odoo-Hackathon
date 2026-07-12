import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from '../shared/types';
import { ForbiddenError, UnauthorizedError } from '../shared/errors';

/**
 * Role-Based Access Control middleware factory.
 * Returns middleware that checks if the authenticated user has one of the allowed roles.
 *
 * @example
 * router.get('/assets', authenticate, authorize('ADMIN', 'ASSET_MANAGER'), controller.list);
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
}

/**
 * Middleware that checks if the user belongs to a specific department.
 * Used for department-scoped operations (e.g., dept head approving transfers).
 */
export function authorizeDepartment(departmentIdParam: string = 'departmentId') {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // Admins and asset managers bypass department checks
    if (req.user.role === 'ADMIN' || req.user.role === 'ASSET_MANAGER') {
      return next();
    }

    const targetDeptId = req.params[departmentIdParam] || req.body[departmentIdParam];

    if (req.user.departmentId !== targetDeptId) {
      return next(new ForbiddenError('Access denied for this department'));
    }

    next();
  };
}
