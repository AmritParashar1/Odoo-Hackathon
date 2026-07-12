import prisma from '../config/database';
import { DashboardFilterInput } from './reports.schemas';

export class ReportsService {
  async getDashboardMetrics(filters: DashboardFilterInput) {
    const assetWhere: any = {};
    if (filters.departmentId) assetWhere.departmentId = filters.departmentId;
    if (filters.categoryId) assetWhere.categoryId = filters.categoryId;

    const [
      totalAssets,
      assetsByStatus,
      assetsByCondition,
      totalValueResult,
      maintenanceMetrics
    ] = await Promise.all([
      prisma.asset.count({ where: assetWhere }),
      prisma.asset.groupBy({
        by: ['status'],
        where: assetWhere,
        _count: { id: true },
      }),
      prisma.asset.groupBy({
        by: ['condition'],
        where: assetWhere,
        _count: { id: true },
      }),
      prisma.asset.aggregate({
        where: assetWhere,
        _sum: { purchaseCost: true },
      }),
      // Get count of ongoing maintenance
      prisma.maintenanceRequest.count({
        where: {
          status: { in: ['PENDING', 'APPROVED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS'] },
        }
      })
    ]);

    const totalValue = totalValueResult._sum.purchaseCost || 0;

    return {
      totalAssets,
      totalValue,
      activeMaintenanceCount: maintenanceMetrics,
      statusBreakdown: assetsByStatus.map((s: any) => ({ status: s.status, count: s._count.id })),
      conditionBreakdown: assetsByCondition.map((c: any) => ({ condition: c.condition, count: c._count.id })),
    };
  }

  async getAssetLifecycleReport() {
    // Generate a report of assets grouped by category and their current lifecycle stage
    const categories = await prisma.assetCategory.findMany({
      include: {
        _count: {
          select: { assets: true }
        }
      }
    });
    return categories.map((c: any) => ({
      categoryName: c.name,
      totalAssets: c._count.assets
    }));
  }
}

export const reportsService = new ReportsService();
