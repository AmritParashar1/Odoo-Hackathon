import { Response } from 'express';
import { ApiResponse, PaginationMeta } from '../types';

/**
 * Standardized API response helpers.
 * Ensures every response follows the same envelope format.
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200,
  meta?: PaginationMeta
): void {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta,
  };

  res.status(statusCode).json(response);
}

export function sendCreated<T>(
  res: Response,
  data: T,
  message: string = 'Created successfully'
): void {
  sendSuccess(res, data, message, 201);
}

export function sendNoContent(res: Response): void {
  res.status(204).send();
}

export function sendError(
  res: Response,
  message: string = 'Internal server error',
  statusCode: number = 500,
  errors?: Record<string, string[]>
): void {
  const response: ApiResponse = {
    success: false,
    message,
    errors,
  };

  res.status(statusCode).json(response);
}

/**
 * Build pagination metadata from query results.
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
