import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanInstrument } from '../domain/plan-instrument.entity';
import { StrategicObjective } from '../domain/strategic-objective.entity';
import { PlanRepositoryPort } from '../application/ports/plan.repository.port';

@Injectable()
export class TypeOrmPlanRepository implements PlanRepositoryPort {
  constructor(
    @InjectRepository(PlanInstrument)
    private readonly plans: Repository<PlanInstrument>,
    @InjectRepository(StrategicObjective)
    private readonly objectives: Repository<StrategicObjective>,
  ) {}

  findActiveInstrument(): Promise<PlanInstrument | null> {
    return this.plans.findOne({
      where: { status: 'active' },
      order: { year: 'DESC' },
    });
  }

  findObjectivesByPlanId(planId: string): Promise<StrategicObjective[]> {
    return this.objectives.find({
      where: { planInstrumentId: planId },
      order: { code: 'ASC' },
    });
  }
}
