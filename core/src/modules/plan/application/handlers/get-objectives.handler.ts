import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetObjectivesQuery } from '../queries/get-objectives.query';
import {
  PLAN_REPOSITORY,
  PlanRepositoryPort,
} from '../ports/plan.repository.port';

function statusProgress(status: string): number {
  return status === 'done' ? 100 : 0;
}

@QueryHandler(GetObjectivesQuery)
export class GetObjectivesHandler implements IQueryHandler<GetObjectivesQuery> {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private readonly plans: PlanRepositoryPort,
  ) {}

  async execute() {
    const plan = await this.plans.findActiveInstrument();
    if (!plan) {
      throw new NotFoundException('No active plan instrument');
    }
    const objectives = await this.plans.findObjectivesByPlanId(plan.id);
    const ids = objectives.map((o) => o.id);

    const [linkedProjects, linkedTasks, linkedSubtasks] = await Promise.all([
      this.plans.findProjectsLinkedToObjectives(ids),
      this.plans.findTasksLinkedToObjectives(ids),
      this.plans.findSubtasksLinkedToObjectives(ids),
    ]);

    return objectives.map((o) => {
      const projects = linkedProjects
        .filter((p) => p.objectiveId === o.id)
        .map(({ id, code, title, status }) => ({ id, code, title, status }));
      const tasks = linkedTasks
        .filter((t) => t.objectiveId === o.id)
        .map(({ id, code, title, status }) => ({ id, code, title, status }));
      const subtasks = linkedSubtasks
        .filter((s) => s.objectiveId === o.id)
        .map(({ id, title, status, taskId }) => ({
          id,
          title,
          status,
          taskId,
        }));

      const progressParts = [
        ...projects.map((p) => statusProgress(p.status)),
        ...tasks.map((t) => statusProgress(t.status)),
        ...subtasks.map((s) => statusProgress(s.status)),
      ];
      const progressPercent =
        progressParts.length === 0
          ? null
          : Math.round(
              progressParts.reduce((a, b) => a + b, 0) / progressParts.length,
            );

      return {
        id: o.id,
        code: o.code,
        title: o.title,
        rationale: o.rationale,
        verification: o.verification,
        outOfScope: o.outOfScope,
        diagnosisLinks: o.diagnosisLinks,
        status: o.status,
        planInstrumentId: o.planInstrumentId,
        projects,
        tasks,
        subtasks,
        progressPercent,
      };
    });
  }
}
