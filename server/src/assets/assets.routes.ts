import { Router } from 'express';
import { assetsController } from './assets.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createCategorySchema, updateCategorySchema,
  createAssetSchema, updateAssetSchema, assetFilterSchema,
} from './assets.schemas';
import { idParamSchema } from '../shared/schemas';

const router = Router();

router.use(authenticate);

// ============================================================
// Category Routes
// ============================================================

router.post(
  '/categories',
  authorize('ADMIN'),
  validate({ body: createCategorySchema }),
  assetsController.createCategory
);

router.get('/categories', assetsController.getAllCategories);

router.get(
  '/categories/:id',
  validate({ params: idParamSchema }),
  assetsController.getCategoryById
);

router.patch(
  '/categories/:id',
  authorize('ADMIN'),
  validate({ params: idParamSchema, body: updateCategorySchema }),
  assetsController.updateCategory
);

router.delete(
  '/categories/:id',
  authorize('ADMIN'),
  validate({ params: idParamSchema }),
  assetsController.deleteCategory
);

// ============================================================
// Asset Routes
// ============================================================

router.post(
  '/',
  authorize('ADMIN', 'ASSET_MANAGER'),
  validate({ body: createAssetSchema }),
  assetsController.create
);

router.get(
  '/',
  validate({ query: assetFilterSchema }),
  assetsController.getAll
);

router.get('/stats/status', assetsController.getStatusCounts);

router.get(
  '/:id',
  validate({ params: idParamSchema }),
  assetsController.getById
);

router.patch(
  '/:id',
  authorize('ADMIN', 'ASSET_MANAGER'),
  validate({ params: idParamSchema, body: updateAssetSchema }),
  assetsController.update
);

export default router;
