import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListPreventivePatrolsQuery } from '../queries/list-preventive-patrols.query';
import {
  PREVENTIVE_PATROLS_REPOSITORY,
  PreventivePatrolsRepositoryPort,
} from '../ports/preventive-patrols.repository.port';
import { mapPreventivePatrol } from '../helpers/ppv.mapper';

@QueryHandler(ListPreventivePatrolsQuery)
export class ListPreventivePatrolsHandler
  implements IQueryHandler<ListPreventivePatrolsQuery>
{
  constructor(
    @Inject(PREVENTIVE_PATROLS_REPOSITORY)
    private readonly repo: PreventivePatrolsRepositoryPort,
  ) {}

  async execute(query: ListPreventivePatrolsQuery) {
    const rows = await this.repo.list(query.limit);
    return rows.map(mapPreventivePatrol);
  }
}
