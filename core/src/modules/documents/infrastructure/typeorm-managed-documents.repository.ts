import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ManagedDocument } from '../domain/managed-document.entity';
import { DocumentType } from '../domain/document-type.entity';
import { ManagedDocumentsRepositoryPort } from '../application/ports/managed-documents.repository.port';

@Injectable()
export class TypeOrmManagedDocumentsRepository
  implements ManagedDocumentsRepositoryPort
{
  constructor(
    @InjectRepository(ManagedDocument)
    private readonly docs: Repository<ManagedDocument>,
    @InjectRepository(DocumentType)
    private readonly types: Repository<DocumentType>,
  ) {}

  list(filters?: { status?: string }): Promise<ManagedDocument[]> {
    const where: Record<string, unknown> = { deletedAt: IsNull() };
    if (filters?.status) where.status = filters.status;
    return this.docs.find({
      where,
      relations: ['documentType'],
      order: { updatedAt: 'DESC' },
    });
  }

  findByCode(code: string): Promise<ManagedDocument | null> {
    return this.docs.findOne({
      where: { code, deletedAt: IsNull() },
      relations: ['documentType'],
    });
  }

  async findDocumentTypeIdByCode(code: string): Promise<string | null> {
    const row = await this.types.findOne({
      where: { code, deletedAt: IsNull() },
    });
    return row?.id ?? null;
  }

  create(data: Partial<ManagedDocument>): ManagedDocument {
    return this.docs.create(data);
  }

  save(row: ManagedDocument): Promise<ManagedDocument> {
    return this.docs.save(row);
  }
}
