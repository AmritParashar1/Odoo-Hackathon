import { z } from 'zod';
import { paginationSchema } from '../shared/schemas';

export const createBookingSchema = z.object({
  assetId: z.string().uuid('Invalid asset ID'),
  title: z.string().min(3, 'Title is too short').max(100),
  startTime: z.string().datetime('Start time must be a valid ISO datetime'),
  endTime: z.string().datetime('End time must be a valid ISO datetime'),
  notes: z.string().optional(),
}).refine((data) => new Date(data.startTime) < new Date(data.endTime), {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export const updateBookingSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    return new Date(data.startTime) < new Date(data.endTime);
  }
  return true;
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export const bookingFilterSchema = paginationSchema.extend({
  assetId: z.string().uuid().optional(),
  bookedById: z.string().uuid().optional(),
  status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type BookingFilterInput = z.infer<typeof bookingFilterSchema>;
