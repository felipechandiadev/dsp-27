import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListIncidenciasQuery } from '../queries/list-incidencias.query';
import {
  OPERATIONAL_CASES_REPOSITORY,
  OperationalCasesRepositoryPort,
} from '../ports/operational-cases.repository.port';
import { mapIncidencia } from '../helpers/ops.mapper';

@QueryHandler(ListIncidenciasQuery)
export class ListIncidenciasHandler
  implements IQueryHandler<ListIncidenciasQuery>
{
  constructor(
    @Inject(OPERATIONAL_CASES_REPOSITORY)
    private readonly repo: OperationalCasesRepositoryPort,
  ) {}

  async execute(query: ListIncidenciasQuery) {
    const rows = await this.repo.listIncidencias(query.limit);
    return rows.map(mapIncidencia);
  }
}
