import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PreventivePatrol } from '../domain/preventive-patrol.entity';
import { PreventivePatrolsRepositoryPort } from '../application/ports/preventive-patrols.repository.port';

@Injectable()
export class TypeOrmPreventivePatrolsRepository
  implements PreventivePatrolsRepositoryPort
{
  constructor(
    @InjectRepository(PreventivePatrol)
    private readonly rows: Repository<PreventivePatrol>,
  ) {}

  list(limit = 50): Promise<PreventivePatrol[]> {
    return this.rows.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  findByCode(code: string): Promise<PreventivePatrol | null> {
    return this.rows.findOne({ where: { code } });
  }

  create(data: Partial<PreventivePatrol>): PreventivePatrol {
    return this.rows.create(data);
  }

  save(row: PreventivePatrol): Promise<PreventivePatrol> {
    return this.rows.save(row);
  }
}
