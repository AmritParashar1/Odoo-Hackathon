import { allocationsRepository } from './allocations.repository';
import { assetsRepository } from '../assets/assets.repository';
import { activityLogService } from '../activity-logs/activity-log.service';
import { AllocateAssetInput, ReturnAssetInput, AllocationFilterInput } from './allocations.schemas';
import { NotFoundError, ConflictError, BadRequestError } from '../shared/errors';
import prisma from '../config/database';

export class AllocationsService {
  async allocate(data: AllocateAssetInput, allocatedById: string) {
    const asset = await assetsRepository.findById(data.assetId);
    if (!asset) throw new NotFoundError('Asset not found');

    if (asset.status !== 'AVAILABLE') {
      throw new ConflictError(`Asset cannot be allocated because it is currently ${asset.status}`);
    }

    // Wrap the allocation and asset status update in a transaction
    const allocation = await prisma.$transaction(async (tx: any) => {
      // Create allocation record
      const newAlloc = await tx.allocation.create({
        data: {
          assetId: data.assetId,
          allocatedToId: data.allocatedToId,
          allocatedById,
          expectedReturn: data.expectedReturn ? new Date(data.expectedReturn) : null,
          notes: data.notes,
        },
        include: { asset: true, allocatedTo: true },
      });

      // Update asset status
      await tx.asset.update({
        where: { id: data.assetId },
        data: { status: 'ALLOCATED' },
      });

      return newAlloc;
    });

    await activityLogService.log({
      userId: allocatedById,
      action: 'ASSET_ALLOCATED',
      entityType: 'ASSET',
      entityId: data.assetId,
      newValue: { allocatedToId: data.allocatedToId },
    });

    return allocation;
  }

  async returnAsset(allocationId: string, data: ReturnAssetInput, userId: string) {
    const allocation = await allocationsRepository.findById(allocationId);
    if (!allocation) throw new NotFoundError('Allocation not found');
    if (allocation.status !== 'ACTIVE') throw new BadRequestError('This allocation is not active');

    const result = await prisma.$transaction(async (tx: any) => {
      // Mark allocation as returned
      const returnedAlloc = await tx.allocation.update({
        where: { id: allocationId },
        data: {
          status: 'RETURNED',
          returnedAt: new Date(),
          returnCondition: data.returnCondition,
          returnNotes: data.returnNotes,
        },
      });

      // Mark asset as available and update its condition
      await tx.asset.update({
        where: { id: allocation.assetId },
        data: {
          status: 'AVAILABLE',
          condition: data.returnCondition as any,
        },
      });

      return returnedAlloc;
    });

    await activityLogService.log({
      userId,
      action: 'ASSET_RETURNED',
      entityType: 'ASSET',
      entityId: allocation.assetId,
      newValue: { condition: data.returnCondition },
    });

    return result;
  }

  async getAll(filters: AllocationFilterInput) {
    return allocationsRepository.findAll(filters);
  }

  async getById(id: string) {
    const alloc = await allocationsRepository.findById(id);
    if (!alloc) throw new NotFoundError('Allocation not found');
    return alloc;
  }
}

export const allocationsService = new AllocationsService();
