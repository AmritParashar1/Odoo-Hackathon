import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { sendSuccess } from '../shared/utils/response';

const router = Router();

router.use(authenticate);

// Placeholder routes — will be fully implemented in Phase 10
router.post('/', (_req, res) => {
  sendSuccess(res, null, 'Maintenance module — coming in Phase 10');
});

router.get('/', (_req, res) => {
  sendSuccess(res, [], 'Maintenance requests list — coming in Phase 10');
});

router.patch('/:id/approve', (_req, res) => {
  sendSuccess(res, null, 'Approve maintenance — coming in Phase 10');
});

export default router;
