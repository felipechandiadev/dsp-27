import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
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
import { ListManagedDocumentsQuery } from '../application/queries/list-managed-documents.query';
import { GetManagedDocumentQuery } from '../application/queries/get-managed-document.query';
import { CreateManagedDocumentCommand } from '../application/commands/create-managed-document.command';
import { UpdateManagedDocumentCommand } from '../application/commands/update-managed-document.command';
import { UploadManagedDocumentBodyCommand } from '../application/commands/upload-managed-document-body.command';
import { CreateManagedDocumentDto } from './dto/create-managed-document.dto';
import { UpdateManagedDocumentDto } from './dto/update-managed-document.dto';

@ApiTags('documents-reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents/reports')
export class ManagedDocumentsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  list(@Query('status') status?: string) {
    return this.queryBus.execute(new ListManagedDocumentsQuery(status));
  }

  @Get(':code')
  getOne(@Param('code') code: string) {
    return this.queryBus.execute(new GetManagedDocumentQuery(code));
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateManagedDocumentDto,
  ) {
    return this.commandBus.execute(
      new CreateManagedDocumentCommand(user.id, user.role, {
        title: dto.title,
        documentTypeId: dto.documentTypeId,
        documentTypeCode: dto.documentTypeCode,
        status: dto.status,
        bodyJson: dto.bodyJson,
        bodyHtml: dto.bodyHtml,
        bodyAssetId: dto.bodyAssetId,
      }),
    );
  }

  @Patch(':code')
  update(
    @CurrentUser() user: AuthUser,
    @Param('code') code: string,
    @Body() dto: UpdateManagedDocumentDto,
  ) {
    return this.commandBus.execute(
      new UpdateManagedDocumentCommand(user.role, code, { ...dto }),
    );
  }

  @Put(':code/body')
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
  uploadBody(
    @CurrentUser() user: AuthUser,
    @Param('code') code: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('file es requerido');
    }
    return this.commandBus.execute(
      new UploadManagedDocumentBodyCommand(user.id, user.role, code, {
        buffer: file.buffer,
        mimeType: file.mimetype,
        originalName: file.originalname,
      }),
    );
  }
}
