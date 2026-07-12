import { Router } from 'express';
import { bookingsController } from './bookings.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createBookingSchema, updateBookingSchema, bookingFilterSchema } from './bookings.schemas';
import { idParamSchema } from '../shared/schemas';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  validate({ body: createBookingSchema }),
  bookingsController.create.bind(bookingsController)
);

router.get(
  '/',
  validate({ query: bookingFilterSchema }),
  bookingsController.getAll.bind(bookingsController)
);

router.get(
  '/:id',
  validate({ params: idParamSchema }),
  bookingsController.getById.bind(bookingsController)
);

router.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateBookingSchema }),
  bookingsController.update.bind(bookingsController)
);

export default router;
