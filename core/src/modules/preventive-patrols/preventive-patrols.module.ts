import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordCodesModule } from '@modules/record-codes/record-codes.module';
import { PreventivePatrol } from './domain/preventive-patrol.entity';
import { PREVENTIVE_PATROLS_REPOSITORY } from './application/ports/preventive-patrols.repository.port';
import { TypeOrmPreventivePatrolsRepository } from './infrastructure/typeorm-preventive-patrols.repository';
import { PreventivePatrolsController } from './presentation/preventive-patrols.controller';
import { ListPreventivePatrolsHandler } from './application/handlers/list-preventive-patrols.handler';
import { GetPreventivePatrolHandler } from './application/handlers/get-preventive-patrol.handler';
import { CreatePreventivePatrolHandler } from './application/handlers/create-preventive-patrol.handler';

@Module({
  imports: [
    CqrsModule,
    RecordCodesModule,
    TypeOrmModule.forFeature([PreventivePatrol]),
  ],
  controllers: [PreventivePatrolsController],
  providers: [
    {
      provide: PREVENTIVE_PATROLS_REPOSITORY,
      useClass: TypeOrmPreventivePatrolsRepository,
    },
    ListPreventivePatrolsHandler,
    GetPreventivePatrolHandler,
    CreatePreventivePatrolHandler,
  ],
  exports: [TypeOrmModule, PREVENTIVE_PATROLS_REPOSITORY],
})
export class PreventivePatrolsModule {}
