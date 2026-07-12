import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { notificationFilterSchema } from './notifications.schemas';
import { idParamSchema } from '../shared/schemas';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validate({ query: notificationFilterSchema }),
  notificationsController.getAll.bind(notificationsController)
);

router.patch(
  '/read-all',
  notificationsController.markAllAsRead.bind(notificationsController)
);

router.patch(
  '/:id/read',
  validate({ params: idParamSchema }),
  notificationsController.markAsRead.bind(notificationsController)
);

export default router;
