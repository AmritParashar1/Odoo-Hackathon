import prisma from '../config/database';
import { BookingFilterInput } from './bookings.schemas';

export class BookingsRepository {
  async create(data: any) {
    return prisma.booking.create({
      data,
      include: {
        asset: { select: { name: true, assetTag: true } },
        bookedBy: { select: { firstName: true, lastName: true, email: true } },
      },
    });
  }

  async findOverlapping(assetId: string, startTime: Date, endTime: Date, excludeId?: string) {
    const where: any = {
      assetId,
      status: 'CONFIRMED',
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    };
    
    if (excludeId) {
      where.id = { not: excludeId };
    }

    return prisma.booking.findFirst({ where });
  }

  async findById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        asset: { select: { name: true, assetTag: true, categoryId: true } },
        bookedBy: { select: { firstName: true, lastName: true, email: true } },
      },
    });
  }

  async findAll(filters: BookingFilterInput) {
    const { page, limit, status, assetId, bookedById, from, to } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (assetId) where.assetId = assetId;
    if (bookedById) where.bookedById = bookedById;
    
    if (from || to) {
      where.startTime = {};
      if (from) where.startTime.gte = new Date(from);
      if (to) where.startTime.lte = new Date(to);
    }

    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: 'asc' },
        include: {
          asset: { select: { name: true, assetTag: true } },
          bookedBy: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async update(id: string, data: any) {
    return prisma.booking.update({
      where: { id },
      data,
      include: {
        asset: { select: { name: true, assetTag: true } },
      },
    });
  }

  async delete(id: string) {
    return prisma.booking.delete({ where: { id } });
  }
}

export const bookingsRepository = new BookingsRepository();
