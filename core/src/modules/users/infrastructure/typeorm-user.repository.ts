import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@modules/users/domain/user.entity';
import { UserRepositoryPort } from '../application/ports/user.repository.port';

@Injectable()
export class TypeOrmUserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findByUsername(username: string): Promise<User | null> {
    return this.repo.findOne({
      where: { username, status: 'active' },
      relations: ['person'],
    });
  }

  findByIdWithPerson(id: string): Promise<User | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['person'],
    });
  }

  async updateLastLogin(id: string, at: Date): Promise<void> {
    await this.repo.update({ id }, { lastLoginAt: at });
  }
}
