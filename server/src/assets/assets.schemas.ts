import { z } from 'zod';

// ============================================================
// Asset Category Schemas
// ============================================================

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100).trim(),
  code: z.string().min(2).max(10).toUpperCase().trim(),
  description: z.string().max(500).optional(),
  isBookable: z.boolean().default(false),
});

export const updateCategorySchema = createCategorySchema.partial();

// ============================================================
// Asset Schemas
// ============================================================

export const createAssetSchema = z.object({
  name: z.string().min(1, 'Asset name is required').max(200).trim(),
  description: z.string().max(1000).optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  departmentId: z.string().uuid('Invalid department ID').optional(),
  serialNumber: z.string().max(100).optional(),
  purchaseDate: z.string().datetime().optional(),
  purchaseCost: z.number().positive().optional(),
  warrantyExpiry: z.string().datetime().optional(),
  location: z.string().max(200).optional(),
  condition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).default('NEW'),
  notes: z.string().max(1000).optional(),
});

export const updateAssetSchema = createAssetSchema.partial().extend({
  status: z.enum([
    'AVAILABLE', 'ALLOCATED', 'RESERVED',
    'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED',
  ]).optional(),
});

export const assetFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  status: z.enum([
    'AVAILABLE', 'ALLOCATED', 'RESERVED',
    'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED',
  ]).optional(),
  categoryId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  condition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type AssetFilterInput = z.infer<typeof assetFilterSchema>;
