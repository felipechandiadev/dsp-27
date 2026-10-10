import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetIncidenciaQuery } from '../queries/get-incidencia.query';
import {
  OPERATIONAL_CASES_REPOSITORY,
  OperationalCasesRepositoryPort,
} from '../ports/operational-cases.repository.port';
import { mapIncidencia } from '../helpers/ops.mapper';

@QueryHandler(GetIncidenciaQuery)
export class GetIncidenciaHandler implements IQueryHandler<GetIncidenciaQuery> {
  constructor(
    @Inject(OPERATIONAL_CASES_REPOSITORY)
    private readonly repo: OperationalCasesRepositoryPort,
  ) {}

  async execute(query: GetIncidenciaQuery) {
    const row = await this.repo.findIncidenciaByCode(query.code);
    if (!row) throw new NotFoundException('Incidencia no encontrada');
    return mapIncidencia(row);
  }
}
