import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contractor } from '../domain/contractor.entity';
import { Contract } from '../domain/contract.entity';
import { ContractPeriod } from '../domain/contract-period.entity';
import { ContractPeriodDocument } from '../domain/contract-period-document.entity';
import { ContractsRepositoryPort } from '../application/ports/contracts.repository.port';

@Injectable()
export class TypeOrmContractsRepository implements ContractsRepositoryPort {
  constructor(
    @InjectRepository(Contractor)
    private readonly contractors: Repository<Contractor>,
    @InjectRepository(Contract)
    private readonly contracts: Repository<Contract>,
    @InjectRepository(ContractPeriod)
    private readonly periods: Repository<ContractPeriod>,
    @InjectRepository(ContractPeriodDocument)
    private readonly documents: Repository<ContractPeriodDocument>,
  ) {}

  listContracts(filters?: {
    kind?: string;
    status?: string;
  }): Promise<Contract[]> {
    const where: Record<string, string> = {};
    if (filters?.kind) where.kind = filters.kind;
    if (filters?.status) where.status = filters.status;
    return this.contracts.find({
      where,
      relations: ['contractor'],
      order: { code: 'ASC' },
    });
  }

  findContractByCode(code: string): Promise<Contract | null> {
    return this.contracts.findOne({
      where: { code },
      relations: ['contractor', 'periods', 'periods.documents'],
    });
  }

  findContractorByRut(rut: string): Promise<Contractor | null> {
    return this.contractors.findOne({ where: { rut } });
  }

  saveContractor(contractor: Contractor): Promise<Contractor> {
    return this.contractors.save(contractor);
  }

  saveContract(contract: Contract): Promise<Contract> {
    return this.contracts.save(contract);
  }

  findPeriod(
    contractId: string,
    year: number,
    month: number,
  ): Promise<ContractPeriod | null> {
    return this.periods.findOne({
      where: { contractId, year, month },
      relations: ['documents', 'contract', 'contract.contractor'],
    });
  }

  findPeriodById(periodId: string): Promise<ContractPeriod | null> {
    return this.periods.findOne({
      where: { id: periodId },
      relations: ['documents', 'contract', 'contract.contractor'],
    });
  }

  savePeriod(period: ContractPeriod): Promise<ContractPeriod> {
    return this.periods.save(period);
  }

  saveDocuments(
    docs: ContractPeriodDocument[],
  ): Promise<ContractPeriodDocument[]> {
    return this.documents.save(docs);
  }

  findDocument(
    periodId: string,
    docType: string,
  ): Promise<ContractPeriodDocument | null> {
    return this.documents.findOne({ where: { periodId, docType } });
  }

  saveDocument(doc: ContractPeriodDocument): Promise<ContractPeriodDocument> {
    return this.documents.save(doc);
  }

  createContractor(data: Partial<Contractor>): Contractor {
    return this.contractors.create(data);
  }

  createContract(data: Partial<Contract>): Contract {
    return this.contracts.create(data);
  }

  createPeriod(data: Partial<ContractPeriod>): ContractPeriod {
    return this.periods.create(data);
  }

  createDocument(data: Partial<ContractPeriodDocument>): ContractPeriodDocument {
    return this.documents.create(data);
  }
}
