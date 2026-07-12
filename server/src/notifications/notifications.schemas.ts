import { z } from 'zod';
import { paginationSchema } from '../shared/schemas';

export const notificationFilterSchema = paginationSchema.extend({
  isRead: z.boolean().optional(),
});

export type NotificationFilterInput = z.infer<typeof notificationFilterSchema>;
