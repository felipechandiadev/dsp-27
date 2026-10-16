import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetSubtaskQuery } from '../queries/get-subtask.query';
import {
  PORTFOLIO_REPOSITORY,
  PortfolioRepositoryPort,
} from '../ports/portfolio.repository.port';
import { mapSubtask } from '../helpers/subtask.mapper';

@QueryHandler(GetSubtaskQuery)
export class GetSubtaskHandler implements IQueryHandler<GetSubtaskQuery> {
  constructor(
    @Inject(PORTFOLIO_REPOSITORY)
    private readonly portfolio: PortfolioRepositoryPort,
  ) {}

  async execute(query: GetSubtaskQuery) {
    const row = await this.portfolio.findSubtaskWithObjectives(
      query.subtaskId,
    );
    if (!row) throw new NotFoundException('Subtarea no encontrada');
    return mapSubtask(row);
  }
}
