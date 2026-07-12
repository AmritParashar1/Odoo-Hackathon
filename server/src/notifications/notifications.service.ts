import prisma from '../config/database';
import logger from '../shared/utils/logger';

interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type: string;
  entityType?: string;
  entityId?: string;
}

/**
 * Notification service — creates in-app notifications.
 * Socket.io integration will be added in Phase 13.
 */
export class NotificationService {
  async create(input: CreateNotificationInput) {
    const notification = await prisma.notification.create({ data: input });
    logger.info(`Notification sent to user ${input.userId}: ${input.title}`);
    // TODO: Phase 13 — emit via Socket.io
    return notification;
  }

  async createBulk(inputs: CreateNotificationInput[]) {
    return prisma.notification.createMany({ data: inputs });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}

export const notificationService = new NotificationService();
