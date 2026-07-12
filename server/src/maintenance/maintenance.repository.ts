import prisma from '../config/database';
import { MaintenanceFilterInput } from './maintenance.schemas';

export class MaintenanceRepository {
  async create(data: any) {
    return prisma.maintenanceRequest.create({
      data,
      include: {
        asset: { select: { name: true, assetTag: true } },
        raisedBy: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async findById(id: string) {
    return prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        asset: true,
        raisedBy: { select: { firstName: true, lastName: true, email: true } },
      },
    });
  }

  async findAll(filters: MaintenanceFilterInput) {
    const { page, limit, status, assetId, raisedById, priority } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (assetId) where.assetId = assetId;
    if (raisedById) where.raisedById = raisedById;
    if (priority) where.priority = priority;

    const [data, total] = await Promise.all([
      prisma.maintenanceRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          asset: { select: { name: true, assetTag: true } },
          raisedBy: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.maintenanceRequest.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async update(id: string, data: any) {
    return prisma.maintenanceRequest.update({
      where: { id },
      data,
    });
  }
}

export const maintenanceRepository = new MaintenanceRepository();
