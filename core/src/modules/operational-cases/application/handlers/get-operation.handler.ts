import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOperationQuery } from '../queries/get-operation.query';
import {
  OPERATIONAL_CASES_REPOSITORY,
  OperationalCasesRepositoryPort,
} from '../ports/operational-cases.repository.port';
import { mapFieldOperation } from '../helpers/ops.mapper';

@QueryHandler(GetOperationQuery)
export class GetOperationHandler implements IQueryHandler<GetOperationQuery> {
  constructor(
    @Inject(OPERATIONAL_CASES_REPOSITORY)
    private readonly repo: OperationalCasesRepositoryPort,
  ) {}

  async execute(query: GetOperationQuery) {
    const row = await this.repo.findOperationByCode(query.code);
    if (!row) throw new NotFoundException('Operación no encontrada');
    return mapFieldOperation(row);
  }
}
