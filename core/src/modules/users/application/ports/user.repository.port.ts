import { User } from '@modules/users/domain/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepositoryPort {
  findByUsername(username: string): Promise<User | null>;
  findByIdWithPerson(id: string): Promise<User | null>;
  updateLastLogin(id: string, at: Date): Promise<void>;
}
