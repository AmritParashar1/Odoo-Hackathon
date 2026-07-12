import { Router } from 'express';
import { auditsController } from './audits.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { createAuditSchema, updateAuditSchema, addAuditEntrySchema, auditFilterSchema } from './audits.schemas';
import { idParamSchema } from '../shared/schemas';

const router = Router();

router.use(authenticate);

// Only admins and asset managers can manage audit cycles
router.post(
  '/',
  authorize('ADMIN', 'ASSET_MANAGER'),
  validate({ body: createAuditSchema }),
  auditsController.create.bind(auditsController)
);

router.get(
  '/',
  authorize('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'),
  validate({ query: auditFilterSchema }),
  auditsController.getAll.bind(auditsController)
);

router.get(
  '/:id',
  authorize('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'),
  validate({ params: idParamSchema }),
  auditsController.getById.bind(auditsController)
);

router.patch(
  '/:id',
  authorize('ADMIN', 'ASSET_MANAGER'),
  validate({ params: idParamSchema, body: updateAuditSchema }),
  auditsController.updateStatus.bind(auditsController)
);

router.post(
  '/:id/entries',
  authorize('ADMIN', 'ASSET_MANAGER'),
  validate({ params: idParamSchema, body: addAuditEntrySchema }),
  auditsController.addEntry.bind(auditsController)
);

export default router;
