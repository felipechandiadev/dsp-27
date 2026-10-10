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
import { ListIncidentTypesQuery } from '../application/queries/list-incident-types.query';
import { ListOperationTypesQuery } from '../application/queries/list-operation-types.query';
import { ListIncidenciasQuery } from '../application/queries/list-incidencias.query';
import { GetIncidenciaQuery } from '../application/queries/get-incidencia.query';
import { ListRequerimientosQuery } from '../application/queries/list-requerimientos.query';
import { GetRequerimientoQuery } from '../application/queries/get-requerimiento.query';
import { ListOperationsQuery } from '../application/queries/list-operations.query';
import { GetOperationQuery } from '../application/queries/get-operation.query';
import { CreateIncidentTypeCommand } from '../application/commands/create-incident-type.command';
import { CreateIncidenciaCommand } from '../application/commands/create-incidencia.command';
import { PatchIncidenciaVerificationCommand } from '../application/commands/patch-incidencia-verification.command';
import { PatchIncidenciaCommand } from '../application/commands/patch-incidencia.command';
import { CreateRequerimientoCommand } from '../application/commands/create-requerimiento.command';
import { PatchRequerimientoStatusCommand } from '../application/commands/patch-requerimiento-status.command';
import { PatchRequerimientoCommand } from '../application/commands/patch-requerimiento.command';
import { CloseRequerimientoCommand } from '../application/commands/close-requerimiento.command';
import { DeployOperationCommand } from '../application/commands/deploy-operation.command';
import { PatchOperationStatusCommand } from '../application/commands/patch-operation-status.command';
import { PatchOperationCommand } from '../application/commands/patch-operation.command';
import { CreateIncidentTypeDto } from './dto/create-incident-type.dto';
import { CreateIncidenciaDto } from './dto/create-incidencia.dto';
import { PatchIncidenciaVerificationDto } from './dto/patch-incidencia-verification.dto';
import { PatchIncidenciaDto } from './dto/patch-incidencia.dto';
import { CreateRequerimientoDto } from './dto/create-requerimiento.dto';
import { PatchRequerimientoStatusDto } from './dto/patch-requerimiento-status.dto';
import { PatchRequerimientoDto } from './dto/patch-requerimiento.dto';
import { CloseRequerimientoDto } from './dto/close-requerimiento.dto';
import { DeployOperationDto } from './dto/deploy-operation.dto';
import { PatchOperationStatusDto } from './dto/patch-operation-status.dto';
import { PatchOperationDto } from './dto/patch-operation.dto';

@ApiTags('operational-cases')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('operational-cases')
export class OperationalCasesController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('incident-types')
  listIncidentTypes() {
    return this.queryBus.execute(new ListIncidentTypesQuery());
  }

  @Post('incident-types')
  createIncidentType(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateIncidentTypeDto,
  ) {
    return this.commandBus.execute(
      new CreateIncidentTypeCommand(user.role, {
        name: dto.name,
        sortOrder: dto.sortOrder,
      }),
    );
  }

  @Get('operation-types')
  listOperationTypes() {
    return this.queryBus.execute(new ListOperationTypesQuery());
  }

  @Get('incidencias')
  listIncidencias(@Query('limit') limit?: string) {
    return this.queryBus.execute(
      new ListIncidenciasQuery(limit ? Number(limit) : undefined),
    );
  }

  @Get('incidencias/:code')
  getIncidencia(@Param('code') code: string) {
    return this.queryBus.execute(new GetIncidenciaQuery(code));
  }

  @Post('incidencias')
  createIncidencia(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateIncidenciaDto,
  ) {
    return this.commandBus.execute(
      new CreateIncidenciaCommand(user.role, { ...dto }),
    );
  }

  @Patch('incidencias/:code/verification')
  patchVerification(
    @CurrentUser() user: AuthUser,
    @Param('code') code: string,
    @Body() dto: PatchIncidenciaVerificationDto,
  ) {
    return this.commandBus.execute(
      new PatchIncidenciaVerificationCommand(user.role, code, dto.status),
    );
  }

  @Patch('incidencias/:code')
  patchIncidencia(
    @CurrentUser() user: AuthUser,
    @Param('code') code: string,
    @Body() dto: PatchIncidenciaDto,
  ) {
    return this.commandBus.execute(
      new PatchIncidenciaCommand(user.role, code, { ...dto }),
    );
  }

  @Get('requerimientos')
  listRequerimientos(
    @Query('open') open?: string,
    @Query('limit') limit?: string,
  ) {
    const openOnly = open === '1' || open === 'true';
    return this.queryBus.execute(
      new ListRequerimientosQuery(
        openOnly,
        limit ? Number(limit) : undefined,
      ),
    );
  }

  @Get('requerimientos/:code')
  getRequerimiento(@Param('code') code: string) {
    return this.queryBus.execute(new GetRequerimientoQuery(code));
  }

  @Post('requerimientos')
  createRequerimiento(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateRequerimientoDto,
  ) {
    return this.commandBus.execute(
      new CreateRequerimientoCommand(user.role, { ...dto }),
    );
  }

  @Patch('requerimientos/:code/status')
  patchReqStatus(
    @CurrentUser() user: AuthUser,
    @Param('code') code: string,
    @Body() dto: PatchRequerimientoStatusDto,
  ) {
    return this.commandBus.execute(
      new PatchRequerimientoStatusCommand(user.role, code, dto.status),
    );
  }

  @Patch('requerimientos/:code/close')
  closeReq(
    @CurrentUser() user: AuthUser,
    @Param('code') code: string,
    @Body() dto: CloseRequerimientoDto,
  ) {
    return this.commandBus.execute(
      new CloseRequerimientoCommand(user.role, code, dto.status, dto.reason),
    );
  }

  @Patch('requerimientos/:code')
  patchRequerimiento(
    @CurrentUser() user: AuthUser,
    @Param('code') code: string,
    @Body() dto: PatchRequerimientoDto,
  ) {
    return this.commandBus.execute(
      new PatchRequerimientoCommand(user.role, code, { ...dto }),
    );
  }

  @Get('operations')
  listOperations(
    @Query('active') active?: string,
    @Query('limit') limit?: string,
  ) {
    const activeOnly =
      active === undefined || active === '1' || active === 'true';
    return this.queryBus.execute(
      new ListOperationsQuery(
        active === 'false' || active === '0' ? false : activeOnly,
        limit ? Number(limit) : undefined,
      ),
    );
  }

  @Get('operations/:code')
  getOperation(@Param('code') code: string) {
    return this.queryBus.execute(new GetOperationQuery(code));
  }

  @Post('operations')
  deploy(
    @CurrentUser() user: AuthUser,
    @Body() dto: DeployOperationDto,
  ) {
    return this.commandBus.execute(
      new DeployOperationCommand(user.role, { ...dto }),
    );
  }

  @Patch('operations/:code/status')
  patchOpStatus(
    @CurrentUser() user: AuthUser,
    @Param('code') code: string,
    @Body() dto: PatchOperationStatusDto,
  ) {
    return this.commandBus.execute(
      new PatchOperationStatusCommand(user.role, code, dto.status),
    );
  }

  @Patch('operations/:code')
  patchOperation(
    @CurrentUser() user: AuthUser,
    @Param('code') code: string,
    @Body() dto: PatchOperationDto,
  ) {
    return this.commandBus.execute(
      new PatchOperationCommand(user.role, code, { ...dto }),
    );
  }
}
