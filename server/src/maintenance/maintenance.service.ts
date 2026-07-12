import { maintenanceRepository } from './maintenance.repository';
import { assetsRepository } from '../assets/assets.repository';
import { activityLogService } from '../activity-logs/activity-log.service';
import { CreateMaintenanceInput, UpdateMaintenanceInput, MaintenanceFilterInput } from './maintenance.schemas';
import { NotFoundError, BadRequestError } from '../shared/errors';
import prisma from '../config/database';

export class MaintenanceService {
  async requestMaintenance(data: CreateMaintenanceInput, raisedById: string) {
    const asset = await assetsRepository.findById(data.assetId);
    if (!asset) throw new NotFoundError('Asset not found');

    // A maintenance request can be raised regardless of status, but we may want to update the asset to 'UNDER_MAINTENANCE'
    // immediately or upon approval. Let's do it upon approval.

    const request = await maintenanceRepository.create({
      assetId: data.assetId,
      raisedById,
      priority: data.priority,
      issueDescription: data.issueDescription,
      status: 'PENDING',
    });

    await activityLogService.log({
      userId: raisedById,
      action: 'MAINTENANCE_REQUESTED',
      entityType: 'MAINTENANCE',
      entityId: request.id,
      newValue: { priority: data.priority, issueDescription: data.issueDescription },
    });

    return request;
  }

  async update(id: string, data: UpdateMaintenanceInput, userId: string) {
    const request = await maintenanceRepository.findById(id);
    if (!request) throw new NotFoundError('Maintenance request not found');

    const updateData: any = { ...data };

    // Handle timestamp automation based on status changes
    if (data.status === 'APPROVED' && request.status !== 'APPROVED') {
      updateData.approvedAt = new Date();
    }
    if (data.status === 'IN_PROGRESS' && request.status !== 'IN_PROGRESS') {
      updateData.startedAt = new Date();
    }
    if (data.status === 'RESOLVED' && request.status !== 'RESOLVED') {
      updateData.resolvedAt = new Date();
    }

    const updated = await prisma.$transaction(async (tx: any) => {
      const maintenance = await tx.maintenanceRequest.update({
        where: { id },
        data: updateData,
      });

      // Automatically change asset status if maintenance starts or ends
      if (data.status === 'IN_PROGRESS') {
        await tx.asset.update({
          where: { id: request.assetId },
          data: { status: 'UNDER_MAINTENANCE' },
        });
      } else if (data.status === 'RESOLVED') {
        await tx.asset.update({
          where: { id: request.assetId },
          data: { status: 'AVAILABLE' }, // Assuming it returns to available
        });
      }

      return maintenance;
    });

    await activityLogService.log({
      userId,
      action: 'MAINTENANCE_UPDATED',
      entityType: 'MAINTENANCE',
      entityId: id,
      newValue: data,
    });

    return updated;
  }

  async getAll(filters: MaintenanceFilterInput) {
    return maintenanceRepository.findAll(filters);
  }

  async getById(id: string) {
    const req = await maintenanceRepository.findById(id);
    if (!req) throw new NotFoundError('Maintenance request not found');
    return req;
  }
}

export const maintenanceService = new MaintenanceService();
