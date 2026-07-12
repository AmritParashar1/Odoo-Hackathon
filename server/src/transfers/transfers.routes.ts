import { Router } from 'express';
import { transfersController } from './transfers.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createTransferSchema,
  approveTransferSchema,
  rejectTransferSchema,
  transferFilterSchema,
} from './transfers.schemas';
import { idParamSchema } from '../shared/schemas';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'),
  validate({ body: createTransferSchema }),
  transfersController.requestTransfer.bind(transfersController)
);

router.get(
  '/',
  validate({ query: transferFilterSchema }),
  transfersController.getAll.bind(transfersController)
);

router.get(
  '/:id',
  validate({ params: idParamSchema }),
  transfersController.getById.bind(transfersController)
);

router.patch(
  '/:id/approve-dept',
  authorize('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'),
  validate({ params: idParamSchema, body: approveTransferSchema }),
  transfersController.approveDeptHead.bind(transfersController)
);

router.patch(
  '/:id/approve-manager',
  authorize('ADMIN', 'ASSET_MANAGER'),
  validate({ params: idParamSchema, body: approveTransferSchema }),
  transfersController.approveManager.bind(transfersController)
);

router.patch(
  '/:id/reject',
  authorize('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'),
  validate({ params: idParamSchema, body: rejectTransferSchema }),
  transfersController.reject.bind(transfersController)
);

export default router;
