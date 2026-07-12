import { z } from 'zod';
import { paginationSchema } from '../shared/schemas';

export const createMaintenanceSchema = z.object({
  assetId: z.string().uuid('Invalid asset ID'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  issueDescription: z.string().min(10, 'Description must be at least 10 characters').max(1000),
});

export const updateMaintenanceSchema = z.object({
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']).optional(),
  resolution: z.string().optional(),
  technicianName: z.string().optional(),
  estimatedCost: z.number().positive().optional(),
  actualCost: z.number().positive().optional(),
});

export const maintenanceFilterSchema = paginationSchema.extend({
  assetId: z.string().uuid().optional(),
  raisedById: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>;
export type MaintenanceFilterInput = z.infer<typeof maintenanceFilterSchema>;
