import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { sendSuccess } from '../shared/utils/response';

const router = Router();

router.use(authenticate);

// Placeholder routes — will be fully implemented in Phase 8
router.post('/', authorize('ADMIN', 'ASSET_MANAGER'), (_req, res) => {
  sendSuccess(res, null, 'Allocations module — coming in Phase 8');
});

router.get('/', authorize('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), (_req, res) => {
  sendSuccess(res, [], 'Allocations list — coming in Phase 8');
});

router.post('/:id/return', authorize('ADMIN', 'ASSET_MANAGER'), (_req, res) => {
  sendSuccess(res, null, 'Return asset — coming in Phase 8');
});

export default router;
