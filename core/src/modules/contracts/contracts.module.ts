import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contractor } from './domain/contractor.entity';
import { Contract } from './domain/contract.entity';
import { ContractPeriod } from './domain/contract-period.entity';
import { ContractPeriodDocument } from './domain/contract-period-document.entity';
import { CONTRACTS_REPOSITORY } from './application/ports/contracts.repository.port';
import { TypeOrmContractsRepository } from './infrastructure/typeorm-contracts.repository';
import { ContractsController } from './presentation/contracts.controller';
import { ListContractsHandler } from './application/handlers/list-contracts.handler';
import { GetContractHandler } from './application/handlers/get-contract.handler';
import { GetPeriodHandler } from './application/handlers/get-period.handler';
import { CreateContractHandler } from './application/handlers/create-contract.handler';
import { OpenPeriodHandler } from './application/handlers/open-period.handler';
import { UpdatePeriodDocumentHandler } from './application/handlers/update-period-document.handler';
import { CertifyPeriodHandler } from './application/handlers/certify-period.handler';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      Contractor,
      Contract,
      ContractPeriod,
      ContractPeriodDocument,
    ]),
  ],
  controllers: [ContractsController],
  providers: [
    { provide: CONTRACTS_REPOSITORY, useClass: TypeOrmContractsRepository },
    ListContractsHandler,
    GetContractHandler,
    GetPeriodHandler,
    CreateContractHandler,
    OpenPeriodHandler,
    UpdatePeriodDocumentHandler,
    CertifyPeriodHandler,
  ],
  exports: [TypeOrmModule, CONTRACTS_REPOSITORY],
})
export class ContractsModule {}
