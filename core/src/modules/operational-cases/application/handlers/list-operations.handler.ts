import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListOperationsQuery } from '../queries/list-operations.query';
import {
  OPERATIONAL_CASES_REPOSITORY,
  OperationalCasesRepositoryPort,
} from '../ports/operational-cases.repository.port';
import { mapFieldOperation } from '../helpers/ops.mapper';

@QueryHandler(ListOperationsQuery)
export class ListOperationsHandler
  implements IQueryHandler<ListOperationsQuery>
{
  constructor(
    @Inject(OPERATIONAL_CASES_REPOSITORY)
    private readonly repo: OperationalCasesRepositoryPort,
  ) {}

  async execute(query: ListOperationsQuery) {
    const rows = await this.repo.listOperations({
      activeOnly: query.activeOnly,
      limit: query.limit,
    });
    return rows.map(mapFieldOperation);
  }
}
