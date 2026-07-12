import { Response, NextFunction } from 'express';
import { auditsService } from './audits.service';
import { AuthRequest } from '../shared/types';
import { sendSuccess, sendCreated, buildPaginationMeta } from '../shared/utils/response';

export class AuditsController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const audit = await auditsService.create(req.body, req.user!.id);
      sendCreated(res, audit, 'Audit cycle created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await auditsService.getAll(req.query as any);
      const meta = buildPaginationMeta(result.total, result.page, result.limit);
      sendSuccess(res, result.data, 'Audits retrieved', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const audit = await auditsService.getById(req.params.id as string);
      sendSuccess(res, audit, 'Audit retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const audit = await auditsService.updateStatus(req.params.id as string, req.body, req.user!.id);
      sendSuccess(res, audit, 'Audit status updated');
    } catch (error) {
      next(error);
    }
  }

  async addEntry(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await auditsService.addEntry(req.params.id as string, req.body, req.user!.id);
      sendCreated(res, entry, 'Audit entry added successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const auditsController = new AuditsController();
