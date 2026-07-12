import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { sendSuccess } from '../shared/utils/response';
import prisma from '../config/database';

const router = Router();

router.use(authenticate);

// Get user notifications
router.get('/', async (req: any, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    sendSuccess(res, notifications, 'Notifications retrieved');
  } catch (error) {
    next(error);
  }
});

// Mark notification as read
router.patch('/:id/read', async (req: any, res, next) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id as string },
      data: { isRead: true },
    });
    sendSuccess(res, null, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
});

// Mark all as read
router.patch('/read-all', async (req: any, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, isRead: false },
      data: { isRead: true },
    });
    sendSuccess(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
});

export default router;
