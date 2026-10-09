import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LegalNorm } from '../domain/legal-norm.entity';
import { LegalObligation } from '../domain/legal-obligation.entity';
import {
  CreateNormInput,
  LegalRepositoryPort,
} from '../application/ports/legal.repository.port';

@Injectable()
export class TypeOrmLegalRepository implements LegalRepositoryPort {
  constructor(
    @InjectRepository(LegalNorm)
    private readonly norms: Repository<LegalNorm>,
    @InjectRepository(LegalObligation)
    private readonly obligations: Repository<LegalObligation>,
  ) {}

  listNorms(filters?: {
    kind?: string;
    status?: string;
  }): Promise<LegalNorm[]> {
    const where: Record<string, string> = {};
    if (filters?.kind) where.kind = filters.kind;
    if (filters?.status) where.status = filters.status;
    return this.norms.find({
      where: Object.keys(where).length ? where : undefined,
      order: { sortOrder: 'ASC', code: 'ASC' },
    });
  }

  findNormByCode(code: string): Promise<LegalNorm | null> {
    return this.norms.findOne({ where: { code } });
  }

  findNormById(id: string): Promise<LegalNorm | null> {
    return this.norms.findOne({ where: { id } });
  }

  createNorm(data: CreateNormInput): LegalNorm {
    return this.norms.create({
      code: data.code,
      kind: data.kind,
      numberLabel: data.numberLabel,
      shortTitle: data.shortTitle,
      status: data.status,
      publishedOn: data.publishedOn ?? null,
      effectiveOn: data.effectiveOn ?? null,
      summary: data.summary ?? null,
      sortOrder: data.sortOrder ?? 0,
    });
  }

  saveNorm(norm: LegalNorm): Promise<LegalNorm> {
    return this.norms.save(norm);
  }

  listObligations(): Promise<LegalObligation[]> {
    return this.obligations.find({
      relations: ['strategicObjectives', 'projects'],
      order: { code: 'ASC' },
    });
  }
}
