import { auditsRepository } from './audits.repository';
import { assetsRepository } from '../assets/assets.repository';
import { activityLogService } from '../activity-logs/activity-log.service';
import { CreateAuditInput, UpdateAuditInput, AddAuditEntryInput, AuditFilterInput } from './audits.schemas';
import { NotFoundError, ConflictError, BadRequestError } from '../shared/errors';
import prisma from '../config/database';

export class AuditsService {
  async create(data: CreateAuditInput, createdById: string) {
    const audit = await auditsRepository.create({
      ...data,
      createdById,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      status: 'OPEN',
    });

    await activityLogService.log({
      userId: createdById,
      action: 'AUDIT_CREATED',
      entityType: 'AUDIT_CYCLE',
      entityId: audit.id,
      newValue: { title: data.title },
    });

    return audit;
  }

  async updateStatus(id: string, data: UpdateAuditInput, userId: string) {
    const audit = await auditsRepository.findById(id);
    if (!audit) throw new NotFoundError('Audit Cycle not found');

    const updateData: any = { ...data };
    if (data.status === 'CLOSED' && audit.status !== 'CLOSED') {
      updateData.closedAt = new Date();
    }

    const updated = await auditsRepository.update(id, updateData);

    await activityLogService.log({
      userId,
      action: 'AUDIT_UPDATED',
      entityType: 'AUDIT_CYCLE',
      entityId: id,
      newValue: data,
    });

    return updated;
  }

  async addEntry(auditCycleId: string, data: AddAuditEntryInput, verifiedById: string) {
    const audit = await auditsRepository.findById(auditCycleId);
    if (!audit) throw new NotFoundError('Audit Cycle not found');

    if (audit.status === 'CLOSED') {
      throw new BadRequestError('Cannot add entries to a closed audit cycle');
    }

    const asset = await assetsRepository.findById(data.assetId);
    if (!asset) throw new NotFoundError('Asset not found');

    const existing = await auditsRepository.findEntryByAssetAndAudit(auditCycleId, data.assetId);
    if (existing) {
      throw new ConflictError('This asset has already been audited in this cycle');
    }

    const entry = await prisma.$transaction(async (tx: any) => {
      const newEntry = await tx.auditEntry.create({
        data: {
          auditCycleId,
          assetId: data.assetId,
          verifiedById,
          status: data.status,
          condition: data.condition,
          location: data.location,
          notes: data.notes,
          verifiedAt: new Date(),
        },
      });

      // Update actual asset condition if provided
      if (data.condition && data.condition !== asset.condition) {
        await tx.asset.update({
          where: { id: data.assetId },
          data: { condition: data.condition },
        });
      }

      // If missing, we automatically update the asset status
      if (data.status === 'MISSING') {
        await tx.asset.update({
          where: { id: data.assetId },
          data: { status: 'LOST' },
        });
      }

      return newEntry;
    });

    await activityLogService.log({
      userId: verifiedById,
      action: 'AUDIT_ENTRY_ADDED',
      entityType: 'AUDIT_CYCLE',
      entityId: auditCycleId,
      newValue: { assetId: data.assetId, status: data.status },
    });

    return entry;
  }

  async getAll(filters: AuditFilterInput) {
    return auditsRepository.findAll(filters);
  }

  async getById(id: string) {
    const audit = await auditsRepository.findById(id);
    if (!audit) throw new NotFoundError('Audit Cycle not found');
    return audit;
  }
}

export const auditsService = new AuditsService();
