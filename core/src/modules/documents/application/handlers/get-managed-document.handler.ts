import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetManagedDocumentQuery } from '../queries/get-managed-document.query';
import {
  MANAGED_DOCUMENTS_REPOSITORY,
  ManagedDocumentsRepositoryPort,
} from '../ports/managed-documents.repository.port';
import { mapManagedDocument } from '../helpers/managed-document.mapper';

@QueryHandler(GetManagedDocumentQuery)
export class GetManagedDocumentHandler
  implements IQueryHandler<GetManagedDocumentQuery>
{
  constructor(
    @Inject(MANAGED_DOCUMENTS_REPOSITORY)
    private readonly repo: ManagedDocumentsRepositoryPort,
  ) {}

  async execute(query: GetManagedDocumentQuery) {
    const row = await this.repo.findByCode(query.code);
    if (!row) {
      throw new NotFoundException(`Documento ${query.code} no encontrado`);
    }
    return mapManagedDocument(row);
  }
}
