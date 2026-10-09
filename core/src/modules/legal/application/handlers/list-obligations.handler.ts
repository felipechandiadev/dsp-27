import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListObligationsQuery } from '../queries/list-obligations.query';
import {
  LEGAL_REPOSITORY,
  LegalRepositoryPort,
} from '../ports/legal.repository.port';

@QueryHandler(ListObligationsQuery)
export class ListObligationsHandler
  implements IQueryHandler<ListObligationsQuery>
{
  constructor(
    @Inject(LEGAL_REPOSITORY)
    private readonly legal: LegalRepositoryPort,
  ) {}

  async execute() {
    const items = await this.legal.listObligations();
    return items.map((o) => ({
      id: o.id,
      code: o.code,
      articleRef: o.articleRef,
      description: o.description,
      status: o.status,
      legalNormId: o.legalNormId,
      strategicObjectiveCodes: (o.strategicObjectives ?? []).map((s) => s.code),
      projectCodes: (o.projects ?? []).map((p) => p.code),
    }));
  }
}
