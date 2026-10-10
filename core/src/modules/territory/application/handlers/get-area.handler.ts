import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAreaQuery } from '../queries/get-area.query';
import {
  TERRITORY_REPOSITORY,
  TerritoryRepositoryPort,
} from '../ports/territory.repository.port';
import { OperationAreaGeometryService } from '../operation-area-geometry.service';
import { mapArea } from '../helpers/area.mapper';

@QueryHandler(GetAreaQuery)
export class GetAreaHandler implements IQueryHandler<GetAreaQuery> {
  constructor(
    @Inject(TERRITORY_REPOSITORY)
    private readonly repo: TerritoryRepositoryPort,
    private readonly geometry: OperationAreaGeometryService,
  ) {}

  async execute(query: GetAreaQuery) {
    const row = await this.repo.findAreaByCode(query.code);
    if (!row) {
      throw new NotFoundException(`Área no encontrada: ${query.code}`);
    }
    const geom = await this.geometry.readGeometry(row.id);
    return mapArea(row, geom);
  }
}
