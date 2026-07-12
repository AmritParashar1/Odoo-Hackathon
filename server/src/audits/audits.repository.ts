import prisma from '../config/database';
import { AuditFilterInput } from './audits.schemas';

export class AuditsRepository {
  async create(data: any) {
    return prisma.auditCycle.create({
      data,
    });
  }

  async findById(id: string) {
    return prisma.auditCycle.findUnique({
      where: { id },
      include: {
        entries: {
          include: {
            asset: { select: { name: true, assetTag: true, condition: true } },
            verifiedBy: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async findAll(filters: AuditFilterInput) {
    const { page, limit, status, createdById } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (createdById) where.createdById = createdById;

    const [data, total] = await Promise.all([
      prisma.auditCycle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { entries: true } },
        },
      }),
      prisma.auditCycle.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async update(id: string, data: any) {
    return prisma.auditCycle.update({
      where: { id },
      data,
    });
  }

  async addEntry(auditCycleId: string, data: any) {
    return prisma.auditEntry.create({
      data: {
        auditCycleId,
        ...data,
      },
    });
  }

  async findEntryByAssetAndAudit(auditCycleId: string, assetId: string) {
    return prisma.auditEntry.findUnique({
      where: {
        auditCycleId_assetId: { auditCycleId, assetId },
      },
    });
  }
}

export const auditsRepository = new AuditsRepository();
