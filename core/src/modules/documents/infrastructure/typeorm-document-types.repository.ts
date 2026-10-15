import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentType } from '../domain/document-type.entity';
import { DocumentTypesRepositoryPort } from '../application/ports/document-types.repository.port';

@Injectable()
export class TypeOrmDocumentTypesRepository
  implements DocumentTypesRepositoryPort
{
  constructor(
    @InjectRepository(DocumentType)
    private readonly types: Repository<DocumentType>,
  ) {}

  list(status?: string): Promise<DocumentType[]> {
    const where = status ? { status } : undefined;
    return this.types.find({
      where,
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  findById(id: string): Promise<DocumentType | null> {
    return this.types.findOne({ where: { id } });
  }

  findByCode(code: string): Promise<DocumentType | null> {
    return this.types.findOne({ where: { code } });
  }

  create(data: Partial<DocumentType>): DocumentType {
    return this.types.create(data);
  }

  save(row: DocumentType): Promise<DocumentType> {
    return this.types.save(row);
  }
}
