import { Contractor } from '@modules/contracts/domain/contractor.entity';
import { Contract } from '@modules/contracts/domain/contract.entity';
import { ContractPeriod } from '@modules/contracts/domain/contract-period.entity';
import { ContractPeriodDocument } from '@modules/contracts/domain/contract-period-document.entity';

export const CONTRACTS_REPOSITORY = Symbol('CONTRACTS_REPOSITORY');

export interface ContractsRepositoryPort {
  listContracts(filters?: {
    kind?: string;
    status?: string;
  }): Promise<Contract[]>;
  findContractByCode(code: string): Promise<Contract | null>;
  findContractorByRut(rut: string): Promise<Contractor | null>;
  saveContractor(contractor: Contractor): Promise<Contractor>;
  saveContract(contract: Contract): Promise<Contract>;
  findPeriod(
    contractId: string,
    year: number,
    month: number,
  ): Promise<ContractPeriod | null>;
  findPeriodById(periodId: string): Promise<ContractPeriod | null>;
  savePeriod(period: ContractPeriod): Promise<ContractPeriod>;
  saveDocuments(
    docs: ContractPeriodDocument[],
  ): Promise<ContractPeriodDocument[]>;
  findDocument(
    periodId: string,
    docType: string,
  ): Promise<ContractPeriodDocument | null>;
  saveDocument(doc: ContractPeriodDocument): Promise<ContractPeriodDocument>;
  createContractor(data: Partial<Contractor>): Contractor;
  createContract(data: Partial<Contract>): Contract;
  createPeriod(data: Partial<ContractPeriod>): ContractPeriod;
  createDocument(data: Partial<ContractPeriodDocument>): ContractPeriodDocument;
}
