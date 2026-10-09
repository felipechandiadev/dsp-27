import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListNormsQuery } from '../queries/list-norms.query';
import {
  LEGAL_REPOSITORY,
  LegalRepositoryPort,
} from '../ports/legal.repository.port';
import { mapNormListItem } from '../helpers/norm.mapper';

@QueryHandler(ListNormsQuery)
export class ListNormsHandler implements IQueryHandler<ListNormsQuery> {
  constructor(
    @Inject(LEGAL_REPOSITORY)
    private readonly legal: LegalRepositoryPort,
  ) {}

  async execute(query: ListNormsQuery) {
    const norms = await this.legal.listNorms({
      kind: query.kind,
      status: query.status,
    });
    return norms.map(mapNormListItem);
  }
}
