import { z } from 'zod';

export const dashboardFilterSchema = z.object({
  departmentId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
});

export type DashboardFilterInput = z.infer<typeof dashboardFilterSchema>;
