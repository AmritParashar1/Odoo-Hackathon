import { Response, NextFunction } from 'express';
import { allocationsService } from './allocations.service';
import { AuthRequest } from '../shared/types';
import { sendSuccess, sendCreated, buildPaginationMeta } from '../shared/utils/response';

export class AllocationsController {
  async allocate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const allocation = await allocationsService.allocate(req.body, req.user!.id);
      sendCreated(res, allocation, 'Asset successfully allocated');
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await allocationsService.getAll(req.query as any);
      const meta = buildPaginationMeta(result.total, result.page, result.limit);
      sendSuccess(res, result.data, 'Allocations retrieved', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const allocation = await allocationsService.getById(req.params.id as string);
      sendSuccess(res, allocation, 'Allocation retrieved');
    } catch (error) {
      next(error);
    }
  }

  async returnAsset(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await allocationsService.returnAsset(req.params.id as string, req.body, req.user!.id);
      sendSuccess(res, result, 'Asset returned successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const allocationsController = new AllocationsController();
