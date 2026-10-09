import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ListNormsQuery } from '../application/queries/list-norms.query';
import { ListObligationsQuery } from '../application/queries/list-obligations.query';

@ApiTags('legal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('legal')
export class LegalController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('norms')
  listNorms() {
    return this.queryBus.execute(new ListNormsQuery());
  }

  @Get('obligations')
  listObligations() {
    return this.queryBus.execute(new ListObligationsQuery());
  }
}
