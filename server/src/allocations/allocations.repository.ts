import prisma from '../config/database';
import { AllocationFilterInput } from './allocations.schemas';
import { Prisma } from '@prisma/client';

export class AllocationsRepository {
  async create(data: any) {
    return prisma.allocation.create({
      data,
      include: {
        asset: { select: { name: true, assetTag: true } },
        allocatedTo: { select: { firstName: true, lastName: true, email: true } },
      },
    });
  }

  async findById(id: string) {
    return prisma.allocation.findUnique({
      where: { id },
      include: {
        asset: true,
        allocatedTo: { select: { firstName: true, lastName: true, email: true } },
        allocatedBy: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async findAll(filters: AllocationFilterInput) {
    const { page, limit, status, assetId, allocatedToId } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (assetId) where.assetId = assetId;
    if (allocatedToId) where.allocatedToId = allocatedToId;

    const [data, total] = await Promise.all([
      prisma.allocation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          asset: { select: { name: true, assetTag: true, category: { select: { name: true } } } },
          allocatedTo: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.allocation.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findActiveByAssetId(assetId: string) {
    return prisma.allocation.findFirst({
      where: { assetId, status: 'ACTIVE' },
    });
  }

  async returnAsset(id: string, returnCondition: string, returnNotes?: string) {
    return prisma.allocation.update({
      where: { id },
      data: {
        status: 'RETURNED',
        returnedAt: new Date(),
        returnCondition,
        returnNotes,
      },
    });
  }
}

export const allocationsRepository = new AllocationsRepository();
