import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListRequerimientosQuery } from '../queries/list-requerimientos.query';
import {
  OPERATIONAL_CASES_REPOSITORY,
  OperationalCasesRepositoryPort,
} from '../ports/operational-cases.repository.port';
import { mapRequerimiento } from '../helpers/ops.mapper';
import { attachLocationGeometryMany } from '../helpers/ops-location.helper';
import { CaseLocationGeometryService } from '../case-location-geometry.service';

@QueryHandler(ListRequerimientosQuery)
export class ListRequerimientosHandler
  implements IQueryHandler<ListRequerimientosQuery>
{
  constructor(
    @Inject(OPERATIONAL_CASES_REPOSITORY)
    private readonly repo: OperationalCasesRepositoryPort,
    private readonly locationGeom: CaseLocationGeometryService,
  ) {}

  async execute(query: ListRequerimientosQuery) {
    const rows = await this.repo.listRequerimientos({
      openOnly: query.openOnly,
      limit: query.limit,
    });
    return attachLocationGeometryMany(
      this.locationGeom,
      'requerimientos',
      rows.map(mapRequerimiento),
    );
  }
}
