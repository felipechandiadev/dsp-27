import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListNormsQuery } from '../queries/list-norms.query';
import {
  LEGAL_REPOSITORY,
  LegalRepositoryPort,
} from '../ports/legal.repository.port';

@QueryHandler(ListNormsQuery)
export class ListNormsHandler implements IQueryHandler<ListNormsQuery> {
  constructor(
    @Inject(LEGAL_REPOSITORY)
    private readonly legal: LegalRepositoryPort,
  ) {}

  async execute() {
    const norms = await this.legal.listNorms();
    return norms.map((n) => ({
      id: n.id,
      code: n.code,
      kind: n.kind,
      numberLabel: n.numberLabel,
      shortTitle: n.shortTitle,
      status: n.status,
      summary: n.summary,
      sortOrder: n.sortOrder,
    }));
  }
}
