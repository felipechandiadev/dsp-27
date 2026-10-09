import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LegalNorm } from '../domain/legal-norm.entity';
import { LegalObligation } from '../domain/legal-obligation.entity';
import { LegalRepositoryPort } from '../application/ports/legal.repository.port';

@Injectable()
export class TypeOrmLegalRepository implements LegalRepositoryPort {
  constructor(
    @InjectRepository(LegalNorm)
    private readonly norms: Repository<LegalNorm>,
    @InjectRepository(LegalObligation)
    private readonly obligations: Repository<LegalObligation>,
  ) {}

  listNorms(): Promise<LegalNorm[]> {
    return this.norms.find({ order: { sortOrder: 'ASC' } });
  }

  listObligations(): Promise<LegalObligation[]> {
    return this.obligations.find({
      relations: ['strategicObjectives', 'projects'],
      order: { code: 'ASC' },
    });
  }
}
