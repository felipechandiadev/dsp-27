import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MultimediaModule } from '@modules/multimedia/multimedia.module';
import { LegalNorm } from './domain/legal-norm.entity';
import { LegalNormAnalysis } from './domain/legal-norm-analysis.entity';
import { LegalObligation } from './domain/legal-obligation.entity';
import { LEGAL_REPOSITORY } from './application/ports/legal.repository.port';
import { TypeOrmLegalRepository } from './infrastructure/typeorm-legal.repository';
import { LegalController } from './presentation/legal.controller';
import { ListNormsHandler } from './application/handlers/list-norms.handler';
import { GetNormHandler } from './application/handlers/get-norm.handler';
import { CreateNormHandler } from './application/handlers/create-norm.handler';
import { UpdateNormHandler } from './application/handlers/update-norm.handler';
import { ListObligationsHandler } from './application/handlers/list-obligations.handler';

@Module({
  imports: [
    CqrsModule,
    MultimediaModule,
    TypeOrmModule.forFeature([LegalNorm, LegalNormAnalysis, LegalObligation]),
  ],
  controllers: [LegalController],
  providers: [
    { provide: LEGAL_REPOSITORY, useClass: TypeOrmLegalRepository },
    ListNormsHandler,
    GetNormHandler,
    CreateNormHandler,
    UpdateNormHandler,
    ListObligationsHandler,
  ],
  exports: [TypeOrmModule, LEGAL_REPOSITORY],
})
export class LegalModule {}
