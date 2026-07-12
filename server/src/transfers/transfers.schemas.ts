import { z } from 'zod';
import { paginationSchema } from '../shared/schemas';

export const createTransferSchema = z.object({
  assetId: z.string().uuid('Invalid asset ID'),
  toDepartmentId: z.string().uuid('Invalid department ID'),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
});

export const approveTransferSchema = z.object({
  notes: z.string().optional(),
});

export const rejectTransferSchema = z.object({
  reason: z.string().min(5, 'Rejection reason is required').max(500),
});

export const transferFilterSchema = paginationSchema.extend({
  status: z.enum(['REQUESTED', 'DEPT_HEAD_APPROVED', 'MANAGER_APPROVED', 'COMPLETED', 'REJECTED']).optional(),
  assetId: z.string().uuid().optional(),
  requestedById: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
});

export type CreateTransferInput = z.infer<typeof createTransferSchema>;
export type ApproveTransferInput = z.infer<typeof approveTransferSchema>;
export type RejectTransferInput = z.infer<typeof rejectTransferSchema>;
export type TransferFilterInput = z.infer<typeof transferFilterSchema>;
