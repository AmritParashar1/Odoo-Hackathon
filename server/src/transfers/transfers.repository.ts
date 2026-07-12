import prisma from '../config/database';
import { TransferFilterInput } from './transfers.schemas';
import { Prisma } from '@prisma/client';

export class TransfersRepository {
  async create(data: any) {
    return prisma.transferRequest.create({
      data,
      include: {
        asset: { select: { name: true, assetTag: true } },
        requestedBy: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async findById(id: string) {
    return prisma.transferRequest.findUnique({
      where: { id },
      include: {
        asset: true,
        requestedBy: { select: { firstName: true, lastName: true, email: true } },
      },
    });
  }

  async findAll(filters: TransferFilterInput) {
    const { page, limit, status, assetId, requestedById, departmentId } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (assetId) where.assetId = assetId;
    if (requestedById) where.requestedById = requestedById;
    if (departmentId) {
      where.OR = [
        { fromDepartmentId: departmentId },
        { toDepartmentId: departmentId },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.transferRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          asset: { select: { name: true, assetTag: true } },
          requestedBy: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.transferRequest.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async update(id: string, data: any) {
    return prisma.transferRequest.update({
      where: { id },
      data,
    });
  }
}

export const transfersRepository = new TransfersRepository();
