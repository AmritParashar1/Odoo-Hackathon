import { departmentsRepository } from './departments.repository';
import { CreateDepartmentInput, UpdateDepartmentInput } from './departments.schemas';
import { NotFoundError, ConflictError } from '../shared/errors';
import { PaginationParams } from '../shared/types';

export class DepartmentsService {
  async create(data: CreateDepartmentInput) {
    // Check for duplicate name or code
    const [byName, byCode] = await Promise.all([
      departmentsRepository.findByName(data.name),
      departmentsRepository.findByCode(data.code),
    ]);

    if (byName) throw new ConflictError('Department with this name already exists');
    if (byCode) throw new ConflictError('Department with this code already exists');

    return departmentsRepository.create(data);
  }

  async getAll(params: PaginationParams) {
    return departmentsRepository.findAll(params);
  }

  async getById(id: string) {
    const dept = await departmentsRepository.findById(id);
    if (!dept) throw new NotFoundError('Department not found');
    return dept;
  }

  async update(id: string, data: UpdateDepartmentInput) {
    await this.getById(id); // Ensures exists
    return departmentsRepository.update(id, data);
  }

  async delete(id: string) {
    const dept = await departmentsRepository.findById(id);
    if (!dept) throw new NotFoundError('Department not found');

    // Check for active members
    if (dept._count.members > 0) {
      throw new ConflictError(
        `Cannot delete department with ${dept._count.members} active member(s). Reassign them first.`
      );
    }

    return departmentsRepository.delete(id);
  }
}

export const departmentsService = new DepartmentsService();
