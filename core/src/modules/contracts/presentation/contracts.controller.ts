import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { AuthUser } from '@modules/auth/domain/jwt-payload';
import { ListContractsQuery } from '../application/queries/list-contracts.query';
import { GetContractQuery } from '../application/queries/get-contract.query';
import { GetPeriodQuery } from '../application/queries/get-period.query';
import { CreateContractCommand } from '../application/commands/create-contract.command';
import { OpenPeriodCommand } from '../application/commands/open-period.command';
import { UpdatePeriodDocumentCommand } from '../application/commands/update-period-document.command';
import { CertifyPeriodCommand } from '../application/commands/certify-period.command';
import { CreateContractDto } from './dto/create-contract.dto';
import { OpenPeriodDto } from './dto/open-period.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { CertifyPeriodDto } from './dto/certify-period.dto';

@ApiTags('contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contracts')
export class ContractsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  list(@Query('kind') kind?: string, @Query('status') status?: string) {
    return this.queryBus.execute(new ListContractsQuery(kind, status));
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateContractDto) {
    return this.commandBus.execute(
      new CreateContractCommand(user.id, user.role, {
        kind: dto.kind,
        title: dto.title,
        contractorRut: dto.contractorRut,
        contractorName: dto.contractorName,
        contractorEmail: dto.contractorEmail,
        contractorPhone: dto.contractorPhone,
        itsUserId: dto.itsUserId,
        projectId: dto.projectId,
        startsOn: dto.startsOn,
        endsOn: dto.endsOn,
        notes: dto.notes,
      }),
    );
  }

  @Patch('periods/:periodId/documents/:docType')
  updateDoc(
    @CurrentUser() user: AuthUser,
    @Param('periodId') periodId: string,
    @Param('docType') docType: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.commandBus.execute(
      new UpdatePeriodDocumentCommand(
        user.id,
        user.role,
        periodId,
        docType,
        dto.status,
        dto.notes,
      ),
    );
  }

  @Post('periods/:periodId/certify')
  certify(
    @CurrentUser() user: AuthUser,
    @Param('periodId') periodId: string,
    @Body() dto: CertifyPeriodDto,
  ) {
    return this.commandBus.execute(
      new CertifyPeriodCommand(user.id, user.role, periodId, dto.notes),
    );
  }

  @Get(':code')
  getOne(@Param('code') code: string) {
    return this.queryBus.execute(new GetContractQuery(code));
  }

  @Post(':code/periods/open')
  openPeriod(
    @CurrentUser() user: AuthUser,
    @Param('code') code: string,
    @Body() dto: OpenPeriodDto,
  ) {
    const now = new Date();
    const year = dto.year ?? now.getFullYear();
    const month = dto.month ?? now.getMonth() + 1;
    return this.commandBus.execute(
      new OpenPeriodCommand(user.id, user.role, code, year, month),
    );
  }

  @Get(':code/periods/:ym')
  getPeriod(@Param('code') code: string, @Param('ym') ym: string) {
    const [y, m] = ym.split('-').map((x) => parseInt(x, 10));
    return this.queryBus.execute(new GetPeriodQuery(code, y, m));
  }
}
