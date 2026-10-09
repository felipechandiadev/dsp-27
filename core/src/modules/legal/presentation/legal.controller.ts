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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { AuthUser } from '@modules/auth/domain/jwt-payload';
import { MultimediaService } from '@modules/multimedia/application/multimedia.service';
import { ListNormsQuery } from '../application/queries/list-norms.query';
import { GetNormQuery } from '../application/queries/get-norm.query';
import { ListObligationsQuery } from '../application/queries/list-obligations.query';
import { CreateNormCommand } from '../application/commands/create-norm.command';
import { UpdateNormCommand } from '../application/commands/update-norm.command';
import { CreateNormDto } from './dto/create-norm.dto';
import { UpdateNormDto } from './dto/update-norm.dto';
import { assertLegalWriteRole } from '../application/helpers/legal-access';
import {
  LEGAL_REPOSITORY,
  LegalRepositoryPort,
} from '../application/ports/legal.repository.port';
import { mapPdfAsset } from '../application/helpers/norm.mapper';

@ApiTags('legal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('legal')
export class LegalController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly multimedia: MultimediaService,
    @Inject(LEGAL_REPOSITORY)
    private readonly legal: LegalRepositoryPort,
  ) {}

  @Get('norms')
  listNorms(
    @Query('kind') kind?: string,
    @Query('status') status?: string,
  ) {
    return this.queryBus.execute(new ListNormsQuery(kind, status));
  }

  @Get('norms/:code')
  getNorm(@Param('code') code: string) {
    return this.queryBus.execute(new GetNormQuery(code));
  }

  @Post('norms')
  createNorm(@CurrentUser() user: AuthUser, @Body() dto: CreateNormDto) {
    return this.commandBus.execute(
      new CreateNormCommand(user.role, {
        code: dto.code,
        kind: dto.kind,
        numberLabel: dto.numberLabel,
        shortTitle: dto.shortTitle,
        status: dto.status,
        publishedOn: dto.publishedOn,
        effectiveOn: dto.effectiveOn,
        summary: dto.summary,
        sortOrder: dto.sortOrder,
      }),
    );
  }

  @Patch('norms/:code')
  updateNorm(
    @CurrentUser() user: AuthUser,
    @Param('code') code: string,
    @Body() dto: UpdateNormDto,
  ) {
    return this.commandBus.execute(
      new UpdateNormCommand(user.role, code, {
        kind: dto.kind,
        numberLabel: dto.numberLabel,
        shortTitle: dto.shortTitle,
        status: dto.status,
        publishedOn: dto.publishedOn,
        effectiveOn: dto.effectiveOn,
        summary: dto.summary,
        sortOrder: dto.sortOrder,
      }),
    );
  }

  @Post('norms/:code/pdf')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  async uploadPdf(
    @CurrentUser() user: AuthUser,
    @Param('code') code: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    assertLegalWriteRole(user.role);
    if (!file) throw new BadRequestException('file es requerido');
    const norm = await this.legal.findNormByCode(code);
    if (!norm) {
      throw new NotFoundException(`Norma no encontrada: ${code}`);
    }
    const asset = await this.multimedia.upload({
      entityType: 'legal_norm',
      entityId: norm.id,
      kind: 'document',
      mimeType: file.mimetype,
      originalName: file.originalname,
      buffer: file.buffer,
      classification: 'interno',
      uploadedByUserId: user.id,
      replaceDocuments: true,
    });
    return mapPdfAsset(asset);
  }

  @Get('obligations')
  listObligations() {
    return this.queryBus.execute(new ListObligationsQuery());
  }
}
