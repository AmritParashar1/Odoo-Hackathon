import { usersRepository } from './users.repository';
import { UpdateUserInput } from './users.schemas';
import { NotFoundError, BadRequestError } from '../shared/errors';
import { PaginationParams } from '../shared/types';

export class UsersService {
  async getAll(params: PaginationParams) {
    return usersRepository.findAll(params);
  }

  async getById(id: string) {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async update(id: string, data: UpdateUserInput, requesterId: string) {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Prevent self-role change
    if (id === requesterId && data.role) {
      throw new BadRequestError('You cannot change your own role');
    }

    return usersRepository.update(id, data);
  }

  async deactivate(id: string, requesterId: string) {
    if (id === requesterId) {
      throw new BadRequestError('You cannot deactivate your own account');
    }

    const user = await usersRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return usersRepository.delete(id);
  }
}

export const usersService = new UsersService();
