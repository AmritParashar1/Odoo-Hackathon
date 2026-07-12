import { Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { AuthRequest } from '../shared/types';
import { sendSuccess } from '../shared/utils/response';
import { buildPaginationMeta } from '../shared/utils/response';

export class UsersController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await usersService.getAll(req.query as any);
      const meta = buildPaginationMeta(result.total, result.page, result.limit);
      sendSuccess(res, result.data, 'Users retrieved', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.getById(req.params.id as string);
      sendSuccess(res, user, 'User retrieved');
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.update(req.params.id as string, req.body, req.user!.id);
      sendSuccess(res, user, 'User updated');
    } catch (error) {
      next(error);
    }
  }

  async deactivate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await usersService.deactivate(req.params.id as string, req.user!.id);
      sendSuccess(res, null, 'User deactivated');
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
