import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListSubtasksByTaskQuery } from '../queries/list-subtasks-by-task.query';
import {
  PORTFOLIO_REPOSITORY,
  PortfolioRepositoryPort,
} from '../ports/portfolio.repository.port';
import { mapSubtask } from '../helpers/subtask.mapper';

@QueryHandler(ListSubtasksByTaskQuery)
export class ListSubtasksByTaskHandler
  implements IQueryHandler<ListSubtasksByTaskQuery>
{
  constructor(
    @Inject(PORTFOLIO_REPOSITORY)
    private readonly portfolio: PortfolioRepositoryPort,
  ) {}

  async execute(query: ListSubtasksByTaskQuery) {
    const task = await this.portfolio.findTaskById(query.taskId);
    if (!task) throw new NotFoundException('Tarea no encontrada');
    const rows = await this.portfolio.listSubtasksByTaskId(query.taskId);
    return rows.map(mapSubtask);
  }
}
