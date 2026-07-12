import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { sendSuccess } from '../shared/utils/response';

const router = Router();

router.use(authenticate);

// Placeholder — will be fully implemented in Phase 12
router.get(
  '/asset-utilization',
  authorize('ADMIN', 'ASSET_MANAGER'),
  (_req, res) => {
    sendSuccess(res, null, 'Asset utilization report — coming in Phase 12');
  }
);

router.get(
  '/department-summary',
  authorize('ADMIN', 'ASSET_MANAGER'),
  (_req, res) => {
    sendSuccess(res, null, 'Department summary report — coming in Phase 12');
  }
);

router.get(
  '/maintenance',
  authorize('ADMIN', 'ASSET_MANAGER'),
  (_req, res) => {
    sendSuccess(res, null, 'Maintenance report — coming in Phase 12');
  }
);

router.get(
  '/bookings',
  authorize('ADMIN', 'ASSET_MANAGER'),
  (_req, res) => {
    sendSuccess(res, null, 'Booking report — coming in Phase 12');
  }
);

router.get(
  '/idle-assets',
  authorize('ADMIN', 'ASSET_MANAGER'),
  (_req, res) => {
    sendSuccess(res, null, 'Idle assets report — coming in Phase 12');
  }
);

export default router;
