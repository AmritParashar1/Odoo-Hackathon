import { Response, NextFunction } from 'express';
import { maintenanceService } from './maintenance.service';
import { AuthRequest } from '../shared/types';
import { sendSuccess, sendCreated, buildPaginationMeta } from '../shared/utils/response';

export class MaintenanceController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await maintenanceService.requestMaintenance(req.body, req.user!.id);
      sendCreated(res, request, 'Maintenance request submitted');
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await maintenanceService.getAll(req.query as any);
      const meta = buildPaginationMeta(result.total, result.page, result.limit);
      sendSuccess(res, result.data, 'Maintenance requests retrieved', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await maintenanceService.getById(req.params.id as string);
      sendSuccess(res, request, 'Maintenance request retrieved');
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await maintenanceService.update(req.params.id as string, req.body, req.user!.id);
      sendSuccess(res, request, 'Maintenance request updated');
    } catch (error) {
      next(error);
    }
  }
}

export const maintenanceController = new MaintenanceController();
