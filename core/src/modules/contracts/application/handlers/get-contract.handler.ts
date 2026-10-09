import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetContractQuery } from '../queries/get-contract.query';
import {
  CONTRACTS_REPOSITORY,
  ContractsRepositoryPort,
} from '../ports/contracts.repository.port';

@QueryHandler(GetContractQuery)
export class GetContractHandler implements IQueryHandler<GetContractQuery> {
  constructor(
    @Inject(CONTRACTS_REPOSITORY)
    private readonly repo: ContractsRepositoryPort,
  ) {}

  async execute(query: GetContractQuery) {
    const c = await this.repo.findContractByCode(query.code);
    if (!c) throw new NotFoundException(`Contrato ${query.code} no encontrado`);

    const periods = [...(c.periods ?? [])].sort((a, b) =>
      a.year !== b.year ? b.year - a.year : b.month - a.month,
    );

    return {
      id: c.id,
      code: c.code,
      kind: c.kind,
      title: c.title,
      status: c.status,
      startsOn: c.startsOn,
      endsOn: c.endsOn,
      notes: c.notes,
      itsUserId: c.itsUserId,
      projectId: c.projectId,
      contractor: c.contractor
        ? {
            id: c.contractor.id,
            rut: c.contractor.rut,
            name: c.contractor.name,
            email: c.contractor.email,
            phone: c.contractor.phone,
          }
        : null,
      periods: periods.map((p) => ({
        id: p.id,
        year: p.year,
        month: p.month,
        status: p.status,
        docsDueOn: p.docsDueOn,
        certifiedAt: p.certifiedAt,
        ym: `${p.year}-${String(p.month).padStart(2, '0')}`,
      })),
    };
  }
}
