import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListTaskAssigneesQuery } from '../queries/list-task-assignees.query';
import {
  PORTFOLIO_REPOSITORY,
  PortfolioRepositoryPort,
} from '../ports/portfolio.repository.port';

@QueryHandler(ListTaskAssigneesQuery)
export class ListTaskAssigneesHandler
  implements IQueryHandler<ListTaskAssigneesQuery>
{
  constructor(
    @Inject(PORTFOLIO_REPOSITORY)
    private readonly portfolio: PortfolioRepositoryPort,
  ) {}

  async execute(query: ListTaskAssigneesQuery) {
    const task = await this.portfolio.findTaskById(query.taskId);
    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }
    const rows = await this.portfolio.listActiveAssigneesByTaskId(query.taskId);
    return {
      items: rows.map((a) => ({
        id: a.id,
        taskId: a.taskId,
        personId: a.personId,
        staffId: a.staffId,
        assignmentRole: a.assignmentRole,
        assignedAt: a.assignedAt,
        assignedByUserId: a.assignedByUserId,
      })),
    };
  }
}
