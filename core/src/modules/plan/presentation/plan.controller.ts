import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { GetPlanQuery } from '../application/queries/get-plan.query';
import { GetObjectivesQuery } from '../application/queries/get-objectives.query';

@ApiTags('plan')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('plan')
export class PlanController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  getPlan() {
    return this.queryBus.execute(new GetPlanQuery());
  }

  @Get('objectives')
  getObjectives() {
    return this.queryBus.execute(new GetObjectivesQuery());
  }
}
