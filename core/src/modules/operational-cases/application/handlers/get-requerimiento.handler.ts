import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetRequerimientoQuery } from '../queries/get-requerimiento.query';
import {
  OPERATIONAL_CASES_REPOSITORY,
  OperationalCasesRepositoryPort,
} from '../ports/operational-cases.repository.port';
import { mapRequerimiento } from '../helpers/ops.mapper';
import { attachLocationGeometry } from '../helpers/ops-location.helper';
import { CaseLocationGeometryService } from '../case-location-geometry.service';

@QueryHandler(GetRequerimientoQuery)
export class GetRequerimientoHandler
  implements IQueryHandler<GetRequerimientoQuery>
{
  constructor(
    @Inject(OPERATIONAL_CASES_REPOSITORY)
    private readonly repo: OperationalCasesRepositoryPort,
    private readonly locationGeom: CaseLocationGeometryService,
  ) {}

  async execute(query: GetRequerimientoQuery) {
    const row = await this.repo.findRequerimientoByCode(query.code);
    if (!row) throw new NotFoundException('Requerimiento no encontrado');
    return attachLocationGeometry(
      this.locationGeom,
      'requerimientos',
      mapRequerimiento(row),
    );
  }
}
