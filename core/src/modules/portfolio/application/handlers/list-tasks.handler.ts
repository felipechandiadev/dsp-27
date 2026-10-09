import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListTasksQuery } from '../queries/list-tasks.query';
import {
  PORTFOLIO_REPOSITORY,
  PortfolioRepositoryPort,
} from '../ports/portfolio.repository.port';

@QueryHandler(ListTasksQuery)
export class ListTasksHandler implements IQueryHandler<ListTasksQuery> {
  constructor(
    @Inject(PORTFOLIO_REPOSITORY)
    private readonly portfolio: PortfolioRepositoryPort,
  ) {}

  async execute() {
    const tasks = await this.portfolio.listTasks();
    return tasks.map((t) => ({
      id: t.id,
      code: t.code,
      title: t.title,
      status: t.status,
      startsOn: t.startsOn,
      endsOn: t.endsOn,
      leadRole: t.leadRole,
      projectCode: t.project?.code ?? '',
      projectTitle: t.project?.title ?? '',
    }));
  }
}
