import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { AuthUser } from '@modules/auth/domain/jwt-payload';
import { MultimediaService } from '../application/multimedia.service';

@ApiTags('multimedia')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('multimedia')
export class MultimediaController {
  constructor(private readonly multimedia: MultimediaService) {}

  @Get()
  list(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
  ) {
    if (!entityType || !entityId) {
      throw new BadRequestException('entityType y entityId son requeridos');
    }
    return this.multimedia.list(entityType, entityId).then((rows) =>
      rows.map((a) => ({
        id: a.id,
        entityType: a.entityType,
        entityId: a.entityId,
        kind: a.kind,
        mimeType: a.mimeType,
        originalName: a.originalName,
        byteSize: a.byteSize,
        classification: a.classification,
        createdAt: a.createdAt,
      })),
    );
  }

  @Get(':id/content')
  async content(@Param('id') id: string, @Res() res: Response) {
    const { buffer, mimeType, originalName } =
      await this.multimedia.readContent(id);
    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${originalName.replace(/"/g, '')}"`,
    );
    res.send(buffer);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'entityType', 'entityId', 'kind'],
      properties: {
        file: { type: 'string', format: 'binary' },
        entityType: { type: 'string' },
        entityId: { type: 'string' },
        kind: { type: 'string', enum: ['image', 'document'] },
        classification: { type: 'string' },
        replaceImages: { type: 'string' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  async upload(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('entityType') entityType: string,
    @Body('entityId') entityId: string,
    @Body('kind') kind: string,
    @Body('classification') classification?: string,
    @Body('replaceImages') replaceImages?: string,
    @Body('replaceDocuments') replaceDocuments?: string,
  ) {
    if (!file) throw new BadRequestException('file es requerido');
    if (!entityType || !entityId || !kind) {
      throw new BadRequestException(
        'entityType, entityId y kind son requeridos',
      );
    }
    const asset = await this.multimedia.upload({
      entityType,
      entityId,
      kind,
      mimeType: file.mimetype,
      originalName: file.originalname,
      buffer: file.buffer,
      classification,
      uploadedByUserId: user.id,
      replaceImages: replaceImages === 'true' || replaceImages === '1',
      replaceDocuments:
        replaceDocuments === 'true' || replaceDocuments === '1',
    });
    return {
      id: asset.id,
      entityType: asset.entityType,
      entityId: asset.entityId,
      kind: asset.kind,
      mimeType: asset.mimeType,
      originalName: asset.originalName,
      byteSize: asset.byteSize,
    };
  }
}
