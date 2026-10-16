import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { AppConfigService } from '@config/config.service';
import { MultimediaAsset } from '../domain/multimedia-asset.entity';
import {
  OBJECT_STORAGE,
  ObjectStoragePort,
} from './ports/object-storage.port';

const IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const DOCUMENT_MIMES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]);

const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
const DOCUMENT_MAX_BYTES = 20 * 1024 * 1024;

/** Catálogo MVP de vínculos polimórficos (ver modelo §5). */
export const MULTIMEDIA_ENTITY_TYPES = [
  'legal_norm',
  'staff',
  'project',
  'task',
  'contract',
  'subtask',
  'person',
  'plan_instrument',
  'managed_document',
] as const;

@Injectable()
export class MultimediaService {
  constructor(
    @InjectRepository(MultimediaAsset)
    private readonly assets: Repository<MultimediaAsset>,
    @Inject(OBJECT_STORAGE)
    private readonly storage: ObjectStoragePort,
    private readonly config: AppConfigService,
  ) {}

  assertEntityType(entityType: string): void {
    if (
      !(MULTIMEDIA_ENTITY_TYPES as readonly string[]).includes(entityType)
    ) {
      throw new BadRequestException(
        `entityType no permitido: ${entityType}`,
      );
    }
  }

  async list(entityType: string, entityId: string): Promise<MultimediaAsset[]> {
    this.assertEntityType(entityType);
    return this.assets.find({
      where: { entityType, entityId, deletedAt: IsNull() },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findLatestImage(
    entityType: string,
    entityId: string,
  ): Promise<MultimediaAsset | null> {
    return this.assets.findOne({
      where: {
        entityType,
        entityId,
        kind: 'image',
        deletedAt: IsNull(),
      },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  /** Latest image per entityId (first by sortOrder, then createdAt DESC). */
  async findLatestImagesByEntityIds(
    entityType: string,
    entityIds: string[],
  ): Promise<Map<string, MultimediaAsset>> {
    this.assertEntityType(entityType);
    const map = new Map<string, MultimediaAsset>();
    if (entityIds.length === 0) return map;

    const rows = await this.assets
      .createQueryBuilder('a')
      .where('a.entity_type = :entityType', { entityType })
      .andWhere('a.entity_id IN (:...entityIds)', { entityIds })
      .andWhere('a.kind = :kind', { kind: 'image' })
      .andWhere('a.deleted_at IS NULL')
      .orderBy('a.sort_order', 'ASC')
      .addOrderBy('a.created_at', 'DESC')
      .getMany();

    for (const row of rows) {
      if (!map.has(row.entityId)) {
        map.set(row.entityId, row);
      }
    }
    return map;
  }

  async findLatestDocument(
    entityType: string,
    entityId: string,
  ): Promise<MultimediaAsset | null> {
    return this.assets.findOne({
      where: {
        entityType,
        entityId,
        kind: 'document',
        deletedAt: IsNull(),
      },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<MultimediaAsset | null> {
    return this.assets.findOne({ where: { id, deletedAt: IsNull() } });
  }

  async upload(input: {
    entityType: string;
    entityId: string;
    kind: string;
    mimeType: string;
    originalName: string;
    buffer: Buffer;
    classification?: string;
    uploadedByUserId?: string;
    replaceImages?: boolean;
    replaceDocuments?: boolean;
  }): Promise<MultimediaAsset> {
    this.assertEntityType(input.entityType);

    if (input.kind !== 'image' && input.kind !== 'document') {
      throw new BadRequestException('kind debe ser image o document');
    }
    if (input.kind === 'image' && !IMAGE_MIMES.has(input.mimeType)) {
      throw new BadRequestException('MIME de imagen no permitido');
    }
    if (input.kind === 'document' && !DOCUMENT_MIMES.has(input.mimeType)) {
      throw new BadRequestException(
        'MIME de documento no permitido (PDF o DOCX)',
      );
    }
    if (input.buffer.length === 0) {
      throw new BadRequestException('Archivo vacío');
    }
    const maxBytes =
      input.kind === 'document' ? DOCUMENT_MAX_BYTES : IMAGE_MAX_BYTES;
    if (input.buffer.length > maxBytes) {
      throw new BadRequestException(
        input.kind === 'document' ? 'Máximo 20 MB' : 'Máximo 8 MB',
      );
    }

    if (input.replaceImages && input.kind === 'image') {
      const existing = await this.list(input.entityType, input.entityId);
      for (const row of existing.filter((a) => a.kind === 'image')) {
        await this.softDelete(row.id);
      }
    }
    if (input.replaceDocuments && input.kind === 'document') {
      const existing = await this.list(input.entityType, input.entityId);
      for (const row of existing.filter((a) => a.kind === 'document')) {
        await this.softDelete(row.id);
      }
    }

    const safeName = input.originalName
      .replace(/[^a-zA-Z0-9._-]+/g, '_')
      .slice(0, 120);
    const year = new Date().getFullYear();
    const storageKey = `dsp/${year}/${input.entityType}/${input.entityId}/${randomUUID()}-${safeName}`;
    const driver = this.config.storageDriver;

    await this.storage.put(storageKey, input.buffer, input.mimeType);

    const asset = this.assets.create({
      entityType: input.entityType,
      entityId: input.entityId,
      kind: input.kind,
      mimeType: input.mimeType,
      originalName: input.originalName,
      storageKey,
      storageDriver: driver,
      byteSize: input.buffer.length,
      checksum: null,
      classification: input.classification ?? 'interno',
      sortOrder: 0,
      uploadedByUserId: input.uploadedByUserId ?? null,
    });
    return this.assets.save(asset);
  }

  async softDelete(id: string): Promise<void> {
    const asset = await this.findById(id);
    if (!asset) return;
    asset.deletedAt = new Date();
    await this.assets.save(asset);
  }

  async readContent(id: string): Promise<{
    buffer: Buffer;
    mimeType: string;
    originalName: string;
  }> {
    const asset = await this.findById(id);
    if (!asset) throw new NotFoundException('Archivo no encontrado');
    const buffer = await this.storage.get(asset.storageKey);
    return {
      buffer,
      mimeType: asset.mimeType,
      originalName: asset.originalName,
    };
  }
}
