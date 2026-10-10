import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListAreasQuery } from '../queries/list-areas.query';
import {
  TERRITORY_REPOSITORY,
  TerritoryRepositoryPort,
} from '../ports/territory.repository.port';
import { OperationAreaGeometryService } from '../operation-area-geometry.service';
import { mapArea } from '../helpers/area.mapper';

@QueryHandler(ListAreasQuery)
export class ListAreasHandler implements IQueryHandler<ListAreasQuery> {
  constructor(
    @Inject(TERRITORY_REPOSITORY)
    private readonly repo: TerritoryRepositoryPort,
    private readonly geometry: OperationAreaGeometryService,
  ) {}

  async execute(query: ListAreasQuery) {
    const rows = await this.repo.listAreas({
      typeId: query.typeId,
      status: query.status,
    });
    const out: ReturnType<typeof mapArea>[] = [];
    for (const row of rows) {
      const geom = await this.geometry.readGeometry(row.id);
      out.push(mapArea(row, geom));
    }
    return out;
  }
}
