import { Response, NextFunction } from 'express';
import { reportsService } from './reports.service';
import { AuthRequest } from '../shared/types';
import { sendSuccess } from '../shared/utils/response';

export class ReportsController {
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = await reportsService.getDashboardMetrics(req.query as any);
      sendSuccess(res, metrics, 'Dashboard metrics retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getLifecycleReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await reportsService.getAssetLifecycleReport();
      sendSuccess(res, report, 'Lifecycle report retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export const reportsController = new ReportsController();
