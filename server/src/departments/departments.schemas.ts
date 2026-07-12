import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required').max(100).trim(),
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(10)
    .toUpperCase()
    .trim(),
  description: z.string().max(500).optional(),
  headId: z.string().uuid().nullable().optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
