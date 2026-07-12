import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { sendSuccess } from '../shared/utils/response';

const router = Router();

router.use(authenticate);

// Placeholder routes — will be fully implemented in Phase 8
router.post('/', (_req, res) => {
  sendSuccess(res, null, 'Transfer requests module — coming in Phase 8');
});

router.get('/', (_req, res) => {
  sendSuccess(res, [], 'Transfer requests list — coming in Phase 8');
});

router.patch('/:id/approve', (_req, res) => {
  sendSuccess(res, null, 'Approve transfer — coming in Phase 8');
});

export default router;
