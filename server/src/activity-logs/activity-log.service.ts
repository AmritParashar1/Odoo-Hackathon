import prisma from '../config/database';
import logger from '../shared/utils/logger';

interface CreateActivityLogInput {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress?: string;
}

/**
 * Activity Log service.
 * Records all important actions for audit trail.
 * Called from service layers after successful operations.
 */
export class ActivityLogService {
  async log(input: CreateActivityLogInput): Promise<void> {
    try {
      await prisma.activityLog.create({ data: input });
    } catch (error) {
      // Activity logging should never break the main flow
      logger.error('Failed to create activity log:', error);
    }
  }

  async getByEntity(entityType: string, entityId: string) {
    return prisma.activityLog.findMany({
      where: { entityType, entityId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRecent(limit: number = 20) {
    return prisma.activityLog.findMany({
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

export const activityLogService = new ActivityLogService();
