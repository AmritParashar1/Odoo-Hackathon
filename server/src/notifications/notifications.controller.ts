import { Response, NextFunction } from 'express';
import { notificationsService } from './notifications.service';
import { AuthRequest } from '../shared/types';
import { sendSuccess, buildPaginationMeta } from '../shared/utils/response';

export class NotificationsController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await notificationsService.getUserNotifications(req.user!.id, req.query as any);
      const meta = buildPaginationMeta(result.total, result.page, result.limit);
      sendSuccess(res, result.data, 'Notifications retrieved', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationsService.markAsRead(req.params.id as string, req.user!.id);
      sendSuccess(res, null, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationsService.markAllAsRead(req.user!.id);
      sendSuccess(res, null, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }
}

export const notificationsController = new NotificationsController();
