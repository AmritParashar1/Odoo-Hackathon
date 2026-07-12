import { z } from 'zod';
import { paginationSchema } from '../shared/schemas';

export const createAuditSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
});

export const updateAuditSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'CLOSED']).optional(),
  endDate: z.string().datetime().optional(),
});

export const addAuditEntrySchema = z.object({
  assetId: z.string().uuid(),
  status: z.enum(['PENDING', 'VERIFIED', 'DISCREPANCY', 'MISSING']),
  condition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const auditFilterSchema = paginationSchema.extend({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'CLOSED']).optional(),
  createdById: z.string().uuid().optional(),
});

export type CreateAuditInput = z.infer<typeof createAuditSchema>;
export type UpdateAuditInput = z.infer<typeof updateAuditSchema>;
export type AddAuditEntryInput = z.infer<typeof addAuditEntrySchema>;
export type AuditFilterInput = z.infer<typeof auditFilterSchema>;
