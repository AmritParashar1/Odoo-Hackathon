import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { sendSuccess } from '../shared/utils/response';
import prisma from '../config/database';

const router = Router();

router.use(authenticate);

router.get('/', async (_req, res, next) => {
  try {
    // Aggregate KPIs
    const [
      totalAssets,
      availableAssets,
      allocatedAssets,
      underMaintenance,
      pendingTransfers,
      recentActivities,
    ] = await Promise.all([
      prisma.asset.count(),
      prisma.asset.count({ where: { status: 'AVAILABLE' } }),
      prisma.asset.count({ where: { status: 'ALLOCATED' } }),
      prisma.asset.count({ where: { status: 'UNDER_MAINTENANCE' } }),
      prisma.transferRequest.count({ where: { status: 'REQUESTED' } }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

    const dashboard = {
      kpis: {
        totalAssets,
        availableAssets,
        allocatedAssets,
        underMaintenance,
        pendingTransfers,
      },
      recentActivities,
    };

    sendSuccess(res, dashboard, 'Dashboard data retrieved');
  } catch (error) {
    next(error);
  }
});

export default router;
