import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListAreaTypesQuery } from '../queries/list-area-types.query';
import {
  TERRITORY_REPOSITORY,
  TerritoryRepositoryPort,
} from '../ports/territory.repository.port';
import { mapAreaType } from '../helpers/area.mapper';

@QueryHandler(ListAreaTypesQuery)
export class ListAreaTypesHandler
  implements IQueryHandler<ListAreaTypesQuery>
{
  constructor(
    @Inject(TERRITORY_REPOSITORY)
    private readonly repo: TerritoryRepositoryPort,
  ) {}

  async execute(query: ListAreaTypesQuery) {
    const rows = await this.repo.listTypes(query.status);
    return rows.map(mapAreaType);
  }
}
