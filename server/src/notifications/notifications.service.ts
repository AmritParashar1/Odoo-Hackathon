import { notificationsRepository } from './notifications.repository';
import { NotificationFilterInput } from './notifications.schemas';
import { getIO } from './socket';

export class NotificationsService {
  async notifyUser(userId: string, title: string, message: string, type: string, entityType?: string, entityId?: string) {
    // 1. Persist to DB
    const notification = await notificationsRepository.create({
      userId,
      title,
      message,
      type,
      entityType,
      entityId,
    });

    // 2. Emit real-time event
    try {
      getIO().to(`user:${userId}`).emit('new_notification', notification);
    } catch (e) {
      // Socket might not be initialized during certain CLI scripts, ignore silently
    }

    return notification;
  }

  async notifyRole(role: string, title: string, message: string, type: string, entityType?: string, entityId?: string) {
    // Note: To persist this to DB, we'd need to fetch all users with this role.
    // For large systems, it's better to just emit the socket event and let clients fetch on reload.
    // However, for this MVP we'll just emit the socket event.
    try {
      getIO().to(`role:${role}`).emit('new_notification', {
        title, message, type, entityType, entityId, createdAt: new Date()
      });
    } catch (e) {}
  }

  async getUserNotifications(userId: string, filters: NotificationFilterInput) {
    return notificationsRepository.findAll(userId, filters);
  }

  async markAsRead(id: string, userId: string) {
    return notificationsRepository.markAsRead(id, userId);
  }

  async markAllAsRead(userId: string) {
    return notificationsRepository.markAllAsRead(userId);
  }
}

export const notificationsService = new NotificationsService();
