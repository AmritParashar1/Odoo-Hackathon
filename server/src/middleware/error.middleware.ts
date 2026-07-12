import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../shared/errors';
import { sendError } from '../shared/utils/response';
import logger from '../shared/utils/logger';
import { env } from '../config/env';

/**
 * Global error handling middleware.
 * Must be registered LAST in the Express middleware chain.
 *
 * Handles:
 * - AppError subclasses (operational errors with status codes)
 * - ValidationError (with field-level errors)
 * - Prisma known errors (unique constraint, not found)
 * - Unknown errors (500)
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log the error
  if (err instanceof AppError && err.isOperational) {
    logger.warn(`${err.code}: ${err.message}`);
  } else {
    logger.error('Unhandled error:', err);
  }

  // Handle ValidationError (includes field-level errors)
  if (err instanceof ValidationError) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  // Handle operational AppError
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Handle Prisma errors
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any;

    switch (prismaErr.code) {
      case 'P2002': {
        const fields = prismaErr.meta?.target?.join(', ') || 'field';
        sendError(res, `A record with this ${fields} already exists`, 409);
        return;
      }
      case 'P2025': {
        sendError(res, 'Record not found', 404);
        return;
      }
      case 'P2003': {
        sendError(res, 'Related record not found', 400);
        return;
      }
      default: {
        sendError(res, 'Database error', 500);
        return;
      }
    }
  }

  // Unknown error — don't leak internals in production
  const message = env.NODE_ENV === 'development' ? err.message : 'Internal server error';
  sendError(res, message, 500);
}

/**
 * Catch-all for 404 routes.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND'));
}
