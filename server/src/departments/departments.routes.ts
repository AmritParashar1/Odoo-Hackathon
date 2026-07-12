import { Router } from 'express';
import { departmentsController } from './departments.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { createDepartmentSchema, updateDepartmentSchema } from './departments.schemas';
import { paginationSchema, idParamSchema } from '../shared/schemas';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('ADMIN'),
  validate({ body: createDepartmentSchema }),
  departmentsController.create
);

router.get(
  '/',
  authorize('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'),
  validate({ query: paginationSchema }),
  departmentsController.getAll
);

router.get(
  '/:id',
  authorize('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'),
  validate({ params: idParamSchema }),
  departmentsController.getById
);

router.patch(
  '/:id',
  authorize('ADMIN'),
  validate({ params: idParamSchema, body: updateDepartmentSchema }),
  departmentsController.update
);

router.delete(
  '/:id',
  authorize('ADMIN'),
  validate({ params: idParamSchema }),
  departmentsController.delete
);

export default router;
