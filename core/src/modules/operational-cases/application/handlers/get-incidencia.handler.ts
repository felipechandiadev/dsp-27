import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetIncidenciaQuery } from '../queries/get-incidencia.query';
import {
  OPERATIONAL_CASES_REPOSITORY,
  OperationalCasesRepositoryPort,
} from '../ports/operational-cases.repository.port';
import { mapIncidencia } from '../helpers/ops.mapper';
import { attachLocationGeometry } from '../helpers/ops-location.helper';
import { CaseLocationGeometryService } from '../case-location-geometry.service';

@QueryHandler(GetIncidenciaQuery)
export class GetIncidenciaHandler implements IQueryHandler<GetIncidenciaQuery> {
  constructor(
    @Inject(OPERATIONAL_CASES_REPOSITORY)
    private readonly repo: OperationalCasesRepositoryPort,
    private readonly locationGeom: CaseLocationGeometryService,
  ) {}

  async execute(query: GetIncidenciaQuery) {
    const row = await this.repo.findIncidenciaByCode(query.code);
    if (!row) throw new NotFoundException('Incidencia no encontrada');
    return attachLocationGeometry(
      this.locationGeom,
      'incidencias',
      mapIncidencia(row),
    );
  }
}
