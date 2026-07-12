import { Prisma, AssetStatus, AssetCondition } from '@prisma/client';
import prisma from '../config/database';
import { PaginatedResult } from '../shared/types';
import { AssetFilterInput } from './assets.schemas';

export class AssetsRepository {
  // ============================================================
  // Asset Categories
  // ============================================================

  async createCategory(data: Prisma.AssetCategoryCreateInput) {
    return prisma.assetCategory.create({ data });
  }

  async findCategoryById(id: string) {
    return prisma.assetCategory.findUnique({
      where: { id },
      include: { _count: { select: { assets: true } } },
    });
  }

  async findAllCategories() {
    return prisma.assetCategory.findMany({
      include: { _count: { select: { assets: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async updateCategory(id: string, data: Prisma.AssetCategoryUpdateInput) {
    return prisma.assetCategory.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    return prisma.assetCategory.delete({ where: { id } });
  }

  async findCategoryByCode(code: string) {
    return prisma.assetCategory.findUnique({ where: { code } });
  }

  // ============================================================
  // Assets
  // ============================================================

  async create(data: Prisma.AssetCreateInput) {
    return prisma.asset.create({
      data,
      include: {
        category: { select: { id: true, name: true, code: true, isBookable: true } },
        department: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async findById(id: string) {
    return prisma.asset.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, code: true, isBookable: true } },
        department: { select: { id: true, name: true, code: true } },
        allocations: {
          where: { status: 'ACTIVE' },
          include: {
            allocatedTo: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
          take: 1,
        },
      },
    });
  }

  async findAll(filters: AssetFilterInput): Promise<PaginatedResult<any>> {
    const { page, limit, sortBy, sortOrder, search, status, categoryId, departmentId, condition } = filters;

    const where: Prisma.AssetWhereInput = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { assetTag: { contains: search, mode: 'insensitive' } },
              { serialNumber: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(status ? { status } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(departmentId ? { departmentId } : {}),
      ...(condition ? { condition } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, code: true } },
          department: { select: { id: true, name: true, code: true } },
          allocations: {
            where: { status: 'ACTIVE' },
            include: {
              allocatedTo: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
            take: 1,
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.asset.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async update(id: string, data: Prisma.AssetUpdateInput) {
    return prisma.asset.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true, code: true } },
        department: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async updateStatus(id: string, status: AssetStatus) {
    return prisma.asset.update({ where: { id }, data: { status } });
  }

  async findByAssetTag(assetTag: string) {
    return prisma.asset.findUnique({ where: { assetTag } });
  }

  async countByStatus() {
    return prisma.asset.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
  }

  async countByDepartment() {
    return prisma.asset.groupBy({
      by: ['departmentId'],
      _count: { _all: true },
    });
  }

  /**
   * Generate next asset tag: AST-000001, AST-000002, etc.
   */
  async generateAssetTag(): Promise<string> {
    const lastAsset = await prisma.asset.findFirst({
      orderBy: { assetTag: 'desc' },
      select: { assetTag: true },
    });

    if (!lastAsset) return 'AST-000001';

    const lastNum = parseInt(lastAsset.assetTag.split('-')[1], 10);
    return `AST-${String(lastNum + 1).padStart(6, '0')}`;
  }
}

export const assetsRepository = new AssetsRepository();
