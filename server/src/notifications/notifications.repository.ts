import prisma from '../config/database';
import { NotificationFilterInput } from './notifications.schemas';

export class NotificationsRepository {
  async create(data: { userId: string; title: string; message: string; type: string; entityType?: string; entityId?: string }) {
    return prisma.notification.create({
      data,
    });
  }

  async findAll(userId: string, filters: NotificationFilterInput) {
    const { page, limit, isRead } = filters;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (isRead !== undefined) where.isRead = isRead;

    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

export const notificationsRepository = new NotificationsRepository();
