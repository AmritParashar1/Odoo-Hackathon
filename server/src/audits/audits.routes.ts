import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { sendSuccess } from '../shared/utils/response';

const router = Router();

router.use(authenticate);

// Placeholder routes — will be fully implemented in Phase 11
router.post('/', authorize('ADMIN'), (_req, res) => {
  sendSuccess(res, null, 'Audits module — coming in Phase 11');
});

router.get('/', authorize('ADMIN', 'ASSET_MANAGER'), (_req, res) => {
  sendSuccess(res, [], 'Audit cycles list — coming in Phase 11');
});

export default router;
