import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListIncidentTypesQuery } from '../queries/list-incident-types.query';
import {
  OPERATIONAL_CASES_REPOSITORY,
  OperationalCasesRepositoryPort,
} from '../ports/operational-cases.repository.port';
import { mapIncidentType } from '../helpers/ops.mapper';

@QueryHandler(ListIncidentTypesQuery)
export class ListIncidentTypesHandler
  implements IQueryHandler<ListIncidentTypesQuery>
{
  constructor(
    @Inject(OPERATIONAL_CASES_REPOSITORY)
    private readonly repo: OperationalCasesRepositoryPort,
  ) {}

  async execute() {
    const rows = await this.repo.listIncidentTypes();
    return rows.map(mapIncidentType);
  }
}
