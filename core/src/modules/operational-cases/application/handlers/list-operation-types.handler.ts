import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListOperationTypesQuery } from '../queries/list-operation-types.query';
import {
  OPERATIONAL_CASES_REPOSITORY,
  OperationalCasesRepositoryPort,
} from '../ports/operational-cases.repository.port';
import { mapOperationType } from '../helpers/ops.mapper';

@QueryHandler(ListOperationTypesQuery)
export class ListOperationTypesHandler
  implements IQueryHandler<ListOperationTypesQuery>
{
  constructor(
    @Inject(OPERATIONAL_CASES_REPOSITORY)
    private readonly repo: OperationalCasesRepositoryPort,
  ) {}

  async execute() {
    const rows = await this.repo.listOperationTypes();
    return rows.map(mapOperationType);
  }
}
