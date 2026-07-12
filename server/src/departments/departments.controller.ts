import { Response, NextFunction } from 'express';
import { departmentsService } from './departments.service';
import { AuthRequest } from '../shared/types';
import { sendSuccess, sendCreated, buildPaginationMeta } from '../shared/utils/response';

export class DepartmentsController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dept = await departmentsService.create(req.body);
      sendCreated(res, dept, 'Department created');
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await departmentsService.getAll(req.query as any);
      const meta = buildPaginationMeta(result.total, result.page, result.limit);
      sendSuccess(res, result.data, 'Departments retrieved', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dept = await departmentsService.getById(req.params.id as string);
      sendSuccess(res, dept, 'Department retrieved');
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dept = await departmentsService.update(req.params.id as string, req.body);
      sendSuccess(res, dept, 'Department updated');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await departmentsService.delete(req.params.id as string);
      sendSuccess(res, null, 'Department deleted');
    } catch (error) {
      next(error);
    }
  }
}

export const departmentsController = new DepartmentsController();
