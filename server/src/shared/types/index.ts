import { Request } from 'express';
import { Role } from '@prisma/client';

/**
 * Extended Express Request with authenticated user data.
 * Populated by auth middleware after JWT verification.
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    departmentId: string | null;
  };
}

/**
 * Standard API response envelope.
 * All API responses follow this structure for consistency.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: PaginationMeta;
}

/**
 * Pagination metadata included in list responses.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Standard pagination query parameters.
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

/**
 * Paginated result wrapper from repository layer.
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
