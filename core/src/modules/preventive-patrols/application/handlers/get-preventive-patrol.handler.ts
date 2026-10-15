import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPreventivePatrolQuery } from '../queries/get-preventive-patrol.query';
import {
  PREVENTIVE_PATROLS_REPOSITORY,
  PreventivePatrolsRepositoryPort,
} from '../ports/preventive-patrols.repository.port';
import { mapPreventivePatrol } from '../helpers/ppv.mapper';

@QueryHandler(GetPreventivePatrolQuery)
export class GetPreventivePatrolHandler
  implements IQueryHandler<GetPreventivePatrolQuery>
{
  constructor(
    @Inject(PREVENTIVE_PATROLS_REPOSITORY)
    private readonly repo: PreventivePatrolsRepositoryPort,
  ) {}

  async execute(query: GetPreventivePatrolQuery) {
    const row = await this.repo.findByCode(query.code);
    if (!row) throw new NotFoundException('Ficha no encontrada');
    return mapPreventivePatrol(row);
  }
}
