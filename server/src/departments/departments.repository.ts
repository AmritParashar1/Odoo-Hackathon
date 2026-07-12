import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { PaginatedResult, PaginationParams } from '../shared/types';

export class DepartmentsRepository {
  async create(data: Prisma.DepartmentCreateInput) {
    return prisma.department.create({
      data,
      include: { members: { select: { id: true, firstName: true, lastName: true, role: true } } },
    });
  }

  async findById(id: string) {
    return prisma.department.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true,
          },
          where: { isActive: true },
        },
        _count: { select: { assets: true, members: true } },
      },
    });
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<any>> {
    const { page, limit, sortBy = 'name', sortOrder = 'asc', search } = params;

    const where: Prisma.DepartmentWhereInput = {
      isActive: true,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { code: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.department.findMany({
        where,
        include: {
          _count: { select: { assets: true, members: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.department.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async update(id: string, data: Prisma.DepartmentUpdateInput) {
    return prisma.department.update({
      where: { id },
      data,
      include: {
        _count: { select: { assets: true, members: true } },
      },
    });
  }

  async delete(id: string) {
    return prisma.department.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findByCode(code: string) {
    return prisma.department.findUnique({ where: { code } });
  }

  async findByName(name: string) {
    return prisma.department.findUnique({ where: { name } });
  }
}

export const departmentsRepository = new DepartmentsRepository();
