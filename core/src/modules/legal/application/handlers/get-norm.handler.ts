import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetNormQuery } from '../queries/get-norm.query';
import {
  LEGAL_REPOSITORY,
  LegalRepositoryPort,
} from '../ports/legal.repository.port';
import { MultimediaService } from '@modules/multimedia/application/multimedia.service';
import { mapNormDetail } from '../helpers/norm.mapper';

@QueryHandler(GetNormQuery)
export class GetNormHandler implements IQueryHandler<GetNormQuery> {
  constructor(
    @Inject(LEGAL_REPOSITORY)
    private readonly legal: LegalRepositoryPort,
    private readonly multimedia: MultimediaService,
  ) {}

  async execute(query: GetNormQuery) {
    const norm = await this.legal.findNormByCode(query.code);
    if (!norm) {
      throw new NotFoundException(`Norma no encontrada: ${query.code}`);
    }
    const pdf = await this.multimedia.findLatestDocument(
      'legal_norm',
      norm.id,
    );
    return mapNormDetail(norm, pdf);
  }
}
