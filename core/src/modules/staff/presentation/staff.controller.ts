import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { AuthUser } from '@modules/auth/domain/jwt-payload';
import { MultimediaService } from '@modules/multimedia/application/multimedia.service';
import { ListStaffQuery } from '../application/queries/list-staff.query';
import { GetStaffQuery } from '../application/queries/get-staff.query';
import { CreateStaffCommand } from '../application/commands/create-staff.command';
import { UpdateStaffCommand } from '../application/commands/update-staff.command';
import { UpdateRequirementCommand } from '../application/commands/update-requirement.command';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { UpdateRequirementDto } from './dto/update-requirement.dto';
import { assertStaffWriteRole } from '../application/helpers/staff-access';
import {
  STAFF_REPOSITORY,
  StaffRepositoryPort,
} from '../application/ports/staff.repository.port';

@ApiTags('staff')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('staff')
export class StaffController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly multimedia: MultimediaService,
    @Inject(STAFF_REPOSITORY)
    private readonly staffRepo: StaffRepositoryPort,
  ) {}

  @Get()
  list(
    @Query('unit') unit?: string,
    @Query('status') status?: string,
    @Query('inspectorQuality') inspectorQuality?: string,
    @Query('ds97Profile') ds97Profile?: string,
  ) {
    return this.queryBus.execute(
      new ListStaffQuery(unit, status, inspectorQuality, ds97Profile),
    );
  }

  @Get('payroll')
  payroll() {
    return this.queryBus.execute(
      new ListStaffQuery(undefined, 'active', 'granted', undefined),
    );
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateStaffDto) {
    return this.commandBus.execute(
      new CreateStaffCommand(user.id, user.role, {
        unit: dto.unit,
        personaId: dto.personaId,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        maritalStatus: dto.maritalStatus,
        gender: dto.gender,
        nationality: dto.nationality,
        profession: dto.profession,
        ds97Profile: dto.ds97Profile,
        appointmentAt: dto.appointmentAt,
        priorToLaw: dto.priorToLaw,
        employeeNumber: dto.employeeNumber,
        workEmail: dto.workEmail,
        status: dto.status,
      }),
    );
  }

  @Get(':code')
  getOne(@Param('code') code: string) {
    return this.queryBus.execute(new GetStaffQuery(code));
  }

  @Patch(':code')
  update(
    @CurrentUser() user: AuthUser,
    @Param('code') code: string,
    @Body() dto: UpdateStaffDto,
  ) {
    return this.commandBus.execute(
      new UpdateStaffCommand(user.id, user.role, code, {
        unit: dto.unit,
        ds97Profile: dto.ds97Profile,
        inspectorQualityStatus: dto.inspectorQualityStatus,
        forceGrant: dto.forceGrant,
        appointmentAt: dto.appointmentAt,
        priorToLaw: dto.priorToLaw,
        employeeNumber: dto.employeeNumber,
        workEmail: dto.workEmail,
        status: dto.status,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        maritalStatus: dto.maritalStatus,
        gender: dto.gender,
        nationality: dto.nationality,
        profession: dto.profession,
      }),
    );
  }

  @Patch(':code/requirements/:requirementCode')
  updateRequirement(
    @CurrentUser() user: AuthUser,
    @Param('code') code: string,
    @Param('requirementCode') requirementCode: string,
    @Body() dto: UpdateRequirementDto,
  ) {
    return this.commandBus.execute(
      new UpdateRequirementCommand(
        user.id,
        user.role,
        code,
        requirementCode,
        dto.status,
        dto.notes,
      ),
    );
  }

  @Post(':code/avatar')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } }),
  )
  async uploadAvatar(
    @CurrentUser() user: AuthUser,
    @Param('code') code: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    assertStaffWriteRole(user.role);
    if (!file) throw new BadRequestException('file es requerido');
    const staff = await this.staffRepo.findByCode(code);
    if (!staff) throw new NotFoundException(`Staff ${code} no encontrado`);
    const asset = await this.multimedia.upload({
      entityType: 'staff',
      entityId: staff.id,
      kind: 'image',
      mimeType: file.mimetype,
      originalName: file.originalname,
      buffer: file.buffer,
      classification: 'personal',
      uploadedByUserId: user.id,
      replaceImages: true,
    });
    return { id: asset.id, avatarAssetId: asset.id };
  }
}
