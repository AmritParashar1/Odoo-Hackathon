import { bookingsRepository } from './bookings.repository';
import { assetsRepository } from '../assets/assets.repository';
import { activityLogService } from '../activity-logs/activity-log.service';
import { CreateBookingInput, UpdateBookingInput, BookingFilterInput } from './bookings.schemas';
import { NotFoundError, ConflictError, BadRequestError, ForbiddenError } from '../shared/errors';

export class BookingsService {
  async create(data: CreateBookingInput, bookedById: string) {
    const asset = await assetsRepository.findById(data.assetId);
    if (!asset) throw new NotFoundError('Asset not found');

    if (asset.status !== 'AVAILABLE') {
      throw new BadRequestError(`Cannot book this asset because it is currently ${asset.status}`);
    }

    // Ensure the asset category allows booking
    const category = await assetsRepository.findCategoryById(asset.categoryId);
    if (!category || !category.isBookable) {
      throw new BadRequestError('This asset does not belong to a bookable category (e.g., meeting rooms, shared vehicles)');
    }

    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    // Prevent bookings in the past
    if (start < new Date()) {
      throw new BadRequestError('Cannot create a booking in the past');
    }

    // Check for overlapping confirmed bookings
    const overlap = await bookingsRepository.findOverlapping(data.assetId, start, end);
    if (overlap) {
      throw new ConflictError('This asset is already booked for the selected time period');
    }

    const booking = await bookingsRepository.create({
      assetId: data.assetId,
      bookedById,
      title: data.title,
      startTime: start,
      endTime: end,
      notes: data.notes,
      status: 'CONFIRMED',
    });

    await activityLogService.log({
      userId: bookedById,
      action: 'BOOKING_CREATED',
      entityType: 'BOOKING',
      entityId: booking.id,
      newValue: { assetId: data.assetId, startTime: start, endTime: end },
    });

    return booking;
  }

  async getAll(filters: BookingFilterInput) {
    return bookingsRepository.findAll(filters);
  }

  async getById(id: string) {
    const booking = await bookingsRepository.findById(id);
    if (!booking) throw new NotFoundError('Booking not found');
    return booking;
  }

  async update(id: string, data: UpdateBookingInput, userId: string, userRole: string) {
    const booking = await this.getById(id);

    // Only admins/managers or the user who created it can update it
    if (userRole === 'EMPLOYEE' && booking.bookedById !== userId) {
      throw new ForbiddenError('You can only update your own bookings');
    }

    const start = data.startTime ? new Date(data.startTime) : booking.startTime;
    const end = data.endTime ? new Date(data.endTime) : booking.endTime;

    if (data.startTime || data.endTime) {
       const overlap = await bookingsRepository.findOverlapping(booking.assetId, start, end, id);
       if (overlap) {
         throw new ConflictError('The updated time period overlaps with an existing booking');
       }
    }

    const updated = await bookingsRepository.update(id, {
      ...data,
      startTime: data.startTime ? new Date(data.startTime) : undefined,
      endTime: data.endTime ? new Date(data.endTime) : undefined,
    });

    await activityLogService.log({
      userId,
      action: 'BOOKING_UPDATED',
      entityType: 'BOOKING',
      entityId: id,
      newValue: data,
    });

    return updated;
  }
}

export const bookingsService = new BookingsService();
