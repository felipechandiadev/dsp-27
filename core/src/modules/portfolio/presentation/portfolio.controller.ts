import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ListProjectsQuery } from '../application/queries/list-projects.query';
import { GetProjectQuery } from '../application/queries/get-project.query';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class PortfolioController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  list() {
    return this.queryBus.execute(new ListProjectsQuery());
  }

  @Get(':code')
  getOne(@Param('code') code: string) {
    return this.queryBus.execute(new GetProjectQuery(code));
  }
}
