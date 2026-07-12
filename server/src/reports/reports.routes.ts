import { Router } from 'express';
import { reportsController } from './reports.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { dashboardFilterSchema } from './reports.schemas';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'));

router.get(
  '/dashboard',
  validate({ query: dashboardFilterSchema }),
  reportsController.getDashboard.bind(reportsController)
);

router.get(
  '/lifecycle',
  reportsController.getLifecycleReport.bind(reportsController)
);

export default router;
