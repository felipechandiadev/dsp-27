import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListManagedDocumentsQuery } from '../queries/list-managed-documents.query';
import {
  MANAGED_DOCUMENTS_REPOSITORY,
  ManagedDocumentsRepositoryPort,
} from '../ports/managed-documents.repository.port';
import { mapManagedDocumentListItem } from '../helpers/managed-document.mapper';

@QueryHandler(ListManagedDocumentsQuery)
export class ListManagedDocumentsHandler
  implements IQueryHandler<ListManagedDocumentsQuery>
{
  constructor(
    @Inject(MANAGED_DOCUMENTS_REPOSITORY)
    private readonly repo: ManagedDocumentsRepositoryPort,
  ) {}

  async execute(query: ListManagedDocumentsQuery) {
    const rows = await this.repo.list({ status: query.status });
    return rows.map(mapManagedDocumentListItem);
  }
}
