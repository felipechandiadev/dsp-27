import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListDocumentTypesQuery } from '../queries/list-document-types.query';
import {
  DOCUMENT_TYPES_REPOSITORY,
  DocumentTypesRepositoryPort,
} from '../ports/document-types.repository.port';
import { mapDocumentType } from '../helpers/document-type.mapper';

@QueryHandler(ListDocumentTypesQuery)
export class ListDocumentTypesHandler
  implements IQueryHandler<ListDocumentTypesQuery>
{
  constructor(
    @Inject(DOCUMENT_TYPES_REPOSITORY)
    private readonly repo: DocumentTypesRepositoryPort,
  ) {}

  async execute(query: ListDocumentTypesQuery) {
    const rows = await this.repo.list(query.status);
    return rows.map(mapDocumentType);
  }
}
