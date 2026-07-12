import { Router } from 'express';
import { maintenanceController } from './maintenance.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { createMaintenanceSchema, updateMaintenanceSchema, maintenanceFilterSchema } from './maintenance.schemas';
import { idParamSchema } from '../shared/schemas';

const router = Router();

router.use(authenticate);

// Any employee can report an issue
router.post(
  '/',
  authorize('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'),
  validate({ body: createMaintenanceSchema }),
  maintenanceController.create.bind(maintenanceController)
);

router.get(
  '/',
  validate({ query: maintenanceFilterSchema }),
  maintenanceController.getAll.bind(maintenanceController)
);

router.get(
  '/:id',
  validate({ params: idParamSchema }),
  maintenanceController.getById.bind(maintenanceController)
);

// Only managers/admins can approve or update the actual status/cost
router.patch(
  '/:id',
  authorize('ADMIN', 'ASSET_MANAGER'),
  validate({ params: idParamSchema, body: updateMaintenanceSchema }),
  maintenanceController.update.bind(maintenanceController)
);

export default router;
