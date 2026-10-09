import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListContractsQuery } from '../queries/list-contracts.query';
import {
  CONTRACTS_REPOSITORY,
  ContractsRepositoryPort,
} from '../ports/contracts.repository.port';

@QueryHandler(ListContractsQuery)
export class ListContractsHandler implements IQueryHandler<ListContractsQuery> {
  constructor(
    @Inject(CONTRACTS_REPOSITORY)
    private readonly repo: ContractsRepositoryPort,
  ) {}

  async execute(query: ListContractsQuery) {
    const rows = await this.repo.listContracts({
      kind: query.kind,
      status: query.status,
    });
    return rows.map((c) => ({
      id: c.id,
      code: c.code,
      kind: c.kind,
      title: c.title,
      status: c.status,
      startsOn: c.startsOn,
      endsOn: c.endsOn,
      itsUserId: c.itsUserId,
      contractor: c.contractor
        ? {
            id: c.contractor.id,
            rut: c.contractor.rut,
            name: c.contractor.name,
          }
        : null,
    }));
  }
}
