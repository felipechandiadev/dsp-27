import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetObjectivesQuery } from '../queries/get-objectives.query';
import {
  PLAN_REPOSITORY,
  PlanRepositoryPort,
} from '../ports/plan.repository.port';

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
    return objectives.map((o) => ({
      id: o.id,
      code: o.code,
      title: o.title,
      rationale: o.rationale,
      verification: o.verification,
      outOfScope: o.outOfScope,
      diagnosisLinks: o.diagnosisLinks,
      status: o.status,
      planInstrumentId: o.planInstrumentId,
    }));
  }
}
