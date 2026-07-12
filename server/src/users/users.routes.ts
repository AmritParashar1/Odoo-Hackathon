import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateUserSchema } from './users.schemas';
import { paginationSchema, idParamSchema } from '../shared/schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get(
  '/',
  authorize('ADMIN', 'ASSET_MANAGER'),
  validate({ query: paginationSchema }),
  usersController.getAll
);

router.get(
  '/:id',
  authorize('ADMIN', 'ASSET_MANAGER'),
  validate({ params: idParamSchema }),
  usersController.getById
);

router.patch(
  '/:id',
  authorize('ADMIN'),
  validate({ params: idParamSchema, body: updateUserSchema }),
  usersController.update
);

router.delete(
  '/:id',
  authorize('ADMIN'),
  validate({ params: idParamSchema }),
  usersController.deactivate
);

export default router;
