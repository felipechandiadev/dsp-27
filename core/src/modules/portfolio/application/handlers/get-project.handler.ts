import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProjectQuery } from '../queries/get-project.query';
import {
  PORTFOLIO_REPOSITORY,
  PortfolioRepositoryPort,
} from '../ports/portfolio.repository.port';

@QueryHandler(GetProjectQuery)
export class GetProjectHandler implements IQueryHandler<GetProjectQuery> {
  constructor(
    @Inject(PORTFOLIO_REPOSITORY)
    private readonly portfolio: PortfolioRepositoryPort,
  ) {}

  async execute(query: GetProjectQuery) {
    const project = await this.portfolio.findProjectByCode(query.code);
    if (!project) {
      throw new NotFoundException(`Project ${query.code} not found`);
    }
    const tasks = await this.portfolio.listTasksByProjectId(project.id);
    const notesByTask: Record<string, unknown[]> = {};
    for (const task of tasks) {
      const notes = await this.portfolio.listNotes('task', task.id);
      notesByTask[task.id] = notes.map((n) => ({
        id: n.id,
        body: n.body,
        authorUserId: n.authorUserId,
        createdAt: n.createdAt,
      }));
    }

    return {
      id: project.id,
      code: project.code,
      kind: project.kind,
      title: project.title,
      status: project.status,
      leadRole: project.leadRole,
      summary: project.summary,
      problem: project.problem,
      scope: project.scope,
      legalMilestone: project.legalMilestone,
      startsOn: project.startsOn,
      endsOn: project.endsOn,
      objectiveCodes: (project.strategicObjectives ?? []).map((o) => o.code),
      tasks: tasks.map((t) => ({
        id: t.id,
        code: t.code,
        title: t.title,
        description: t.description,
        objectiveText: t.objectiveText,
        status: t.status,
        startsOn: t.startsOn,
        endsOn: t.endsOn,
        notes: notesByTask[t.id] ?? [],
      })),
    };
  }
}
