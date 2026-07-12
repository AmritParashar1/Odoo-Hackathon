import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { sendSuccess } from '../shared/utils/response';

const router = Router();

router.use(authenticate);

// Placeholder routes — will be fully implemented in Phase 9
router.post('/', (_req, res) => {
  sendSuccess(res, null, 'Bookings module — coming in Phase 9');
});

router.get('/', (_req, res) => {
  sendSuccess(res, [], 'Bookings list — coming in Phase 9');
});

router.delete('/:id', (_req, res) => {
  sendSuccess(res, null, 'Cancel booking — coming in Phase 9');
});

export default router;
