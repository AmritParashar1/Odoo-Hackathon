import { Response, NextFunction } from 'express';
import { bookingsService } from './bookings.service';
import { AuthRequest } from '../shared/types';
import { sendSuccess, sendCreated, buildPaginationMeta } from '../shared/utils/response';

export class BookingsController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await bookingsService.create(req.body, req.user!.id);
      sendCreated(res, booking, 'Booking created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await bookingsService.getAll(req.query as any);
      const meta = buildPaginationMeta(result.total, result.page, result.limit);
      sendSuccess(res, result.data, 'Bookings retrieved', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await bookingsService.getById(req.params.id as string);
      sendSuccess(res, booking, 'Booking retrieved');
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await bookingsService.update(
        req.params.id as string, 
        req.body, 
        req.user!.id, 
        req.user!.role
      );
      sendSuccess(res, booking, 'Booking updated');
    } catch (error) {
      next(error);
    }
  }
}

export const bookingsController = new BookingsController();
