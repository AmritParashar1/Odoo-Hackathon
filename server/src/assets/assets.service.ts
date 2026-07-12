import { assetsRepository } from './assets.repository';
import {
  CreateAssetInput, UpdateAssetInput, AssetFilterInput,
  CreateCategoryInput, UpdateCategoryInput,
} from './assets.schemas';
import { NotFoundError, ConflictError, BadRequestError } from '../shared/errors';
import { PaginationParams } from '../shared/types';

export class AssetsService {
  // ============================================================
  // Asset Categories
  // ============================================================

  async createCategory(data: CreateCategoryInput) {
    const existing = await assetsRepository.findCategoryByCode(data.code);
    if (existing) throw new ConflictError('Category with this code already exists');
    return assetsRepository.createCategory(data);
  }

  async getAllCategories() {
    return assetsRepository.findAllCategories();
  }

  async getCategoryById(id: string) {
    const category = await assetsRepository.findCategoryById(id);
    if (!category) throw new NotFoundError('Category not found');
    return category;
  }

  async updateCategory(id: string, data: UpdateCategoryInput) {
    await this.getCategoryById(id);
    return assetsRepository.updateCategory(id, data);
  }

  async deleteCategory(id: string) {
    const category = await assetsRepository.findCategoryById(id);
    if (!category) throw new NotFoundError('Category not found');
    if (category._count.assets > 0) {
      throw new ConflictError(
        `Cannot delete category with ${category._count.assets} asset(s). Reassign them first.`
      );
    }
    return assetsRepository.deleteCategory(id);
  }

  // ============================================================
  // Assets
  // ============================================================

  async create(data: CreateAssetInput) {
    // Validate category exists
    const category = await assetsRepository.findCategoryById(data.categoryId);
    if (!category) throw new NotFoundError('Category not found');

    // Generate asset tag
    const assetTag = await assetsRepository.generateAssetTag();

    const { categoryId, departmentId, ...rest } = data;

    return assetsRepository.create({
      ...rest,
      assetTag,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
      warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : undefined,
      category: { connect: { id: categoryId } },
      department: departmentId ? { connect: { id: departmentId } } : undefined,
    } as any);
  }

  async getAll(filters: AssetFilterInput) {
    return assetsRepository.findAll(filters);
  }

  async getById(id: string) {
    const asset = await assetsRepository.findById(id);
    if (!asset) throw new NotFoundError('Asset not found');
    return asset;
  }

  async update(id: string, data: UpdateAssetInput) {
    const asset = await assetsRepository.findById(id);
    if (!asset) throw new NotFoundError('Asset not found');

    // Prevent status changes to ALLOCATED via direct update
    if (data.status === 'ALLOCATED') {
      throw new BadRequestError('Use the allocation endpoint to allocate assets');
    }

    const updateData: any = { ...data };
    if (data.purchaseDate) updateData.purchaseDate = new Date(data.purchaseDate);
    if (data.warrantyExpiry) updateData.warrantyExpiry = new Date(data.warrantyExpiry);

    // Handle relation fields
    delete updateData.categoryId;
    delete updateData.departmentId;
    if (data.categoryId) updateData.category = { connect: { id: data.categoryId } };
    if (data.departmentId) updateData.department = { connect: { id: data.departmentId } };

    return assetsRepository.update(id, updateData);
  }

  async delete(id: string) {
    const asset = await assetsRepository.findById(id);
    if (!asset) throw new NotFoundError('Asset not found');
    return assetsRepository.deleteAsset(id);
  }

  async getStatusCounts() {
    return assetsRepository.countByStatus();
  }

  async getDepartmentCounts() {
    return assetsRepository.countByDepartment();
  }
}

export const assetsService = new AssetsService();
