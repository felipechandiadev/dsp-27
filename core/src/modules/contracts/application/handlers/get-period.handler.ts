import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPeriodQuery } from '../queries/get-period.query';
import {
  CONTRACTS_REPOSITORY,
  ContractsRepositoryPort,
} from '../ports/contracts.repository.port';
import { canCertify } from '../helpers/period-status';

@QueryHandler(GetPeriodQuery)
export class GetPeriodHandler implements IQueryHandler<GetPeriodQuery> {
  constructor(
    @Inject(CONTRACTS_REPOSITORY)
    private readonly repo: ContractsRepositoryPort,
  ) {}

  async execute(query: GetPeriodQuery) {
    const contract = await this.repo.findContractByCode(query.contractCode);
    if (!contract) {
      throw new NotFoundException(
        `Contrato ${query.contractCode} no encontrado`,
      );
    }
    const period = await this.repo.findPeriod(
      contract.id,
      query.year,
      query.month,
    );
    if (!period) {
      throw new NotFoundException(
        `Período ${query.year}-${query.month} no encontrado`,
      );
    }
    const docs = period.documents ?? [];
    return {
      id: period.id,
      year: period.year,
      month: period.month,
      ym: `${period.year}-${String(period.month).padStart(2, '0')}`,
      status: period.status,
      docsDueOn: period.docsDueOn,
      certifiedAt: period.certifiedAt,
      certificationNotes: period.certificationNotes,
      canCertify: canCertify(docs) && period.status !== 'certified',
      contract: {
        code: contract.code,
        title: contract.title,
        kind: contract.kind,
      },
      documents: docs.map((d) => ({
        id: d.id,
        docType: d.docType,
        status: d.status,
        notes: d.notes,
      })),
    };
  }
}
