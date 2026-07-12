import { Response, NextFunction } from 'express';
import { transfersService } from './transfers.service';
import { AuthRequest } from '../shared/types';
import { sendSuccess, sendCreated, buildPaginationMeta } from '../shared/utils/response';

export class TransfersController {
  async requestTransfer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const transfer = await transfersService.requestTransfer(req.body, req.user!.id);
      sendCreated(res, transfer, 'Transfer request created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await transfersService.getAll(req.query as any);
      const meta = buildPaginationMeta(result.total, result.page, result.limit);
      sendSuccess(res, result.data, 'Transfer requests retrieved', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const transfer = await transfersService.getById(req.params.id as string);
      sendSuccess(res, transfer, 'Transfer request retrieved');
    } catch (error) {
      next(error);
    }
  }

  async approveDeptHead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const transfer = await transfersService.approveByDepartmentHead(
        req.params.id as string,
        req.user!.id,
        req.body.notes
      );
      sendSuccess(res, transfer, 'Approved by Department Head');
    } catch (error) {
      next(error);
    }
  }

  async approveManager(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const transfer = await transfersService.approveByManager(
        req.params.id as string,
        req.user!.id,
        req.body.notes
      );
      sendSuccess(res, transfer, 'Transfer completed by Asset Manager');
    } catch (error) {
      next(error);
    }
  }

  async reject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const transfer = await transfersService.reject(
        req.params.id as string,
        req.user!.id,
        req.body.reason
      );
      sendSuccess(res, transfer, 'Transfer request rejected');
    } catch (error) {
      next(error);
    }
  }
}

export const transfersController = new TransfersController();
