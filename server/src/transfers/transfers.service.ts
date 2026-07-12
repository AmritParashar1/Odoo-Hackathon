import { transfersRepository } from './transfers.repository';
import { assetsRepository } from '../assets/assets.repository';
import { activityLogService } from '../activity-logs/activity-log.service';
import { CreateTransferInput, TransferFilterInput } from './transfers.schemas';
import { NotFoundError, ConflictError, BadRequestError } from '../shared/errors';
import prisma from '../config/database';

export class TransfersService {
  async requestTransfer(data: CreateTransferInput, requestedById: string) {
    const asset = await assetsRepository.findById(data.assetId);
    if (!asset) throw new NotFoundError('Asset not found');

    if (!asset.departmentId) {
      throw new BadRequestError('Asset is not assigned to any department. Cannot initiate transfer.');
    }

    if (asset.departmentId === data.toDepartmentId) {
      throw new BadRequestError('Asset is already in the target department.');
    }

    // Ensure there are no pending transfers for this asset
    const pendingTransfers = await prisma.transferRequest.count({
      where: {
        assetId: data.assetId,
        status: { in: ['REQUESTED', 'DEPT_HEAD_APPROVED', 'MANAGER_APPROVED'] },
      },
    });

    if (pendingTransfers > 0) {
      throw new ConflictError('A pending transfer request already exists for this asset.');
    }

    const transfer = await transfersRepository.create({
      assetId: data.assetId,
      requestedById,
      fromDepartmentId: asset.departmentId,
      toDepartmentId: data.toDepartmentId,
      reason: data.reason,
      status: 'REQUESTED',
    });

    await activityLogService.log({
      userId: requestedById,
      action: 'TRANSFER_REQUESTED',
      entityType: 'TRANSFER_REQUEST',
      entityId: transfer.id,
      newValue: { toDepartmentId: data.toDepartmentId },
    });

    return transfer;
  }

  async approveByDepartmentHead(id: string, userId: string, notes?: string) {
    const transfer = await transfersRepository.findById(id);
    if (!transfer) throw new NotFoundError('Transfer request not found');

    if (transfer.status !== 'REQUESTED') {
      throw new BadRequestError(`Transfer cannot be approved from status: ${transfer.status}`);
    }

    const updated = await transfersRepository.update(id, {
      status: 'DEPT_HEAD_APPROVED',
      deptHeadApproval: true,
      deptHeadApprovedAt: new Date(),
    });

    await activityLogService.log({
      userId,
      action: 'TRANSFER_DEPT_HEAD_APPROVED',
      entityType: 'TRANSFER_REQUEST',
      entityId: id,
      newValue: { notes },
    });

    return updated;
  }

  async approveByManager(id: string, userId: string, notes?: string) {
    const transfer = await transfersRepository.findById(id);
    if (!transfer) throw new NotFoundError('Transfer request not found');

    if (transfer.status !== 'DEPT_HEAD_APPROVED') {
      throw new BadRequestError(`Manager approval requires Dept Head approval first. Current status: ${transfer.status}`);
    }

    // Manager approval completes the transfer and moves the asset
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Update transfer status
      const updatedTransfer = await tx.transferRequest.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          managerApproval: true,
          managerApprovedAt: new Date(),
        },
      });

      // 2. Change asset department
      await tx.asset.update({
        where: { id: transfer.assetId },
        data: { departmentId: transfer.toDepartmentId },
      });

      // 3. Close any active allocations if they exist (since asset moved departments)
      const activeAlloc = await tx.allocation.findFirst({
        where: { assetId: transfer.assetId, status: 'ACTIVE' },
      });

      if (activeAlloc) {
        await tx.allocation.update({
          where: { id: activeAlloc.id },
          data: {
            status: 'TRANSFERRED',
            returnedAt: new Date(),
            returnNotes: `Auto-closed due to department transfer ${id}`,
          },
        });
        
        // Asset becomes available in the new department
        await tx.asset.update({
          where: { id: transfer.assetId },
          data: { status: 'AVAILABLE' }
        });
      }

      return updatedTransfer;
    });

    await activityLogService.log({
      userId,
      action: 'TRANSFER_COMPLETED',
      entityType: 'TRANSFER_REQUEST',
      entityId: id,
      newValue: { notes },
    });

    return result;
  }

  async reject(id: string, userId: string, reason: string) {
    const transfer = await transfersRepository.findById(id);
    if (!transfer) throw new NotFoundError('Transfer request not found');

    if (transfer.status === 'COMPLETED' || transfer.status === 'REJECTED') {
      throw new BadRequestError(`Transfer is already ${transfer.status}`);
    }

    const updated = await transfersRepository.update(id, {
      status: 'REJECTED',
      rejectionReason: reason,
    });

    await activityLogService.log({
      userId,
      action: 'TRANSFER_REJECTED',
      entityType: 'TRANSFER_REQUEST',
      entityId: id,
      newValue: { reason },
    });

    return updated;
  }

  async getAll(filters: TransferFilterInput) {
    return transfersRepository.findAll(filters);
  }

  async getById(id: string) {
    const transfer = await transfersRepository.findById(id);
    if (!transfer) throw new NotFoundError('Transfer request not found');
    return transfer;
  }
}

export const transfersService = new TransfersService();
