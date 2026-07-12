import { z } from 'zod';
import { idParamSchema, paginationSchema } from '../shared/schemas';

export const allocateAssetSchema = z.object({
  assetId: z.string().uuid('Invalid asset ID'),
  allocatedToId: z.string().uuid('Invalid user ID'),
  expectedReturn: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const returnAssetSchema = z.object({
  returnCondition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']),
  returnNotes: z.string().optional(),
});

export const allocationFilterSchema = paginationSchema.extend({
  status: z.enum(['ACTIVE', 'RETURNED', 'OVERDUE', 'TRANSFERRED']).optional(),
  assetId: z.string().uuid().optional(),
  allocatedToId: z.string().uuid().optional(),
});

export type AllocateAssetInput = z.infer<typeof allocateAssetSchema>;
export type ReturnAssetInput = z.infer<typeof returnAssetSchema>;
export type AllocationFilterInput = z.infer<typeof allocationFilterSchema>;
