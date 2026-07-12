import { Router } from 'express';
import { allocationsController } from './allocations.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { allocateAssetSchema, returnAssetSchema, allocationFilterSchema } from './allocations.schemas';
import { idParamSchema } from '../shared/schemas';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('ADMIN', 'ASSET_MANAGER'),
  validate({ body: allocateAssetSchema }),
  allocationsController.allocate.bind(allocationsController)
);

router.get(
  '/',
  authorize('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'),
  validate({ query: allocationFilterSchema }),
  allocationsController.getAll.bind(allocationsController)
);

router.get(
  '/:id',
  validate({ params: idParamSchema }),
  allocationsController.getById.bind(allocationsController)
);

router.post(
  '/:id/return',
  authorize('ADMIN', 'ASSET_MANAGER'),
  validate({ params: idParamSchema, body: returnAssetSchema }),
  allocationsController.returnAsset.bind(allocationsController)
);

export default router;
