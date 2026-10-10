import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListRequerimientosQuery } from '../queries/list-requerimientos.query';
import {
  OPERATIONAL_CASES_REPOSITORY,
  OperationalCasesRepositoryPort,
} from '../ports/operational-cases.repository.port';
import { mapRequerimiento } from '../helpers/ops.mapper';

@QueryHandler(ListRequerimientosQuery)
export class ListRequerimientosHandler
  implements IQueryHandler<ListRequerimientosQuery>
{
  constructor(
    @Inject(OPERATIONAL_CASES_REPOSITORY)
    private readonly repo: OperationalCasesRepositoryPort,
  ) {}

  async execute(query: ListRequerimientosQuery) {
    const rows = await this.repo.listRequerimientos({
      openOnly: query.openOnly,
      limit: query.limit,
    });
    return rows.map(mapRequerimiento);
  }
}
