import { Response, NextFunction } from 'express';
import { assetsService } from './assets.service';
import { AuthRequest } from '../shared/types';
import { sendSuccess, sendCreated, buildPaginationMeta } from '../shared/utils/response';

export class AssetsController {
  // ============================================================
  // Categories
  // ============================================================

  async createCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await assetsService.createCategory(req.body);
      sendCreated(res, category, 'Category created');
    } catch (error) {
      next(error);
    }
  }

  async getAllCategories(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await assetsService.getAllCategories();
      sendSuccess(res, categories, 'Categories retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await assetsService.getCategoryById(req.params.id as string);
      sendSuccess(res, category, 'Category retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await assetsService.updateCategory(req.params.id as string, req.body);
      sendSuccess(res, category, 'Category updated');
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await assetsService.deleteCategory(req.params.id as string);
      sendSuccess(res, null, 'Category deleted');
    } catch (error) {
      next(error);
    }
  }

  // ============================================================
  // Assets
  // ============================================================

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const asset = await assetsService.create(req.body);
      sendCreated(res, asset, 'Asset registered');
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await assetsService.getAll(req.query as any);
      const meta = buildPaginationMeta(result.total, result.page, result.limit);
      sendSuccess(res, result.data, 'Assets retrieved', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const asset = await assetsService.getById(req.params.id as string);
      sendSuccess(res, asset, 'Asset retrieved');
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const asset = await assetsService.update(req.params.id as string, req.body);
      sendSuccess(res, asset, 'Asset updated');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await assetsService.delete(req.params.id as string);
      sendSuccess(res, null, 'Asset deleted completely');
    } catch (error) {
      next(error);
    }
  }

  async getStatusCounts(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const counts = await assetsService.getStatusCounts();
      sendSuccess(res, counts, 'Status counts retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export const assetsController = new AssetsController();
