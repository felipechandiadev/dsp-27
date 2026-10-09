import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListProjectsQuery } from '../queries/list-projects.query';
import {
  PORTFOLIO_REPOSITORY,
  PortfolioRepositoryPort,
} from '../ports/portfolio.repository.port';

@QueryHandler(ListProjectsQuery)
export class ListProjectsHandler implements IQueryHandler<ListProjectsQuery> {
  constructor(
    @Inject(PORTFOLIO_REPOSITORY)
    private readonly portfolio: PortfolioRepositoryPort,
  ) {}

  async execute(query: ListProjectsQuery) {
    const projects = await this.portfolio.listProjects(query.kind);
    return projects.map((p) => ({
      id: p.id,
      code: p.code,
      kind: p.kind,
      title: p.title,
      status: p.status,
      leadRole: p.leadRole,
      summary: p.summary,
      startsOn: p.startsOn,
      endsOn: p.endsOn,
      objectiveCodes: (p.strategicObjectives ?? []).map((o) => o.code),
    }));
  }
}
