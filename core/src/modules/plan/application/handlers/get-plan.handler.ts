import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPlanQuery } from '../queries/get-plan.query';
import {
  PLAN_REPOSITORY,
  PlanRepositoryPort,
} from '../ports/plan.repository.port';

@QueryHandler(GetPlanQuery)
export class GetPlanHandler implements IQueryHandler<GetPlanQuery> {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private readonly plans: PlanRepositoryPort,
  ) {}

  async execute() {
    const plan = await this.plans.findActiveInstrument();
    if (!plan) {
      throw new NotFoundException('No active plan instrument');
    }
    return {
      id: plan.id,
      year: plan.year,
      title: plan.title,
      version: plan.version,
      status: plan.status,
      missionText: plan.missionText,
      visionText: plan.visionText,
      prioritizationNotes: plan.prioritizationNotes,
      resultsExpectedText: plan.resultsExpectedText,
      startsOn: plan.startsOn,
      endsOn: plan.endsOn,
    };
  }
}
