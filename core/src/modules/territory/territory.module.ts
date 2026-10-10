import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordCodesModule } from '@modules/record-codes/record-codes.module';
import { OperationArea } from './domain/operation-area.entity';
import { OperationAreaType } from './domain/operation-area-type.entity';
import { TERRITORY_REPOSITORY } from './application/ports/territory.repository.port';
import { TypeOrmTerritoryRepository } from './infrastructure/typeorm-territory.repository';
import { OperationAreaGeometryService } from './application/operation-area-geometry.service';
import { TerritoryController } from './presentation/territory.controller';
import { ListAreaTypesHandler } from './application/handlers/list-area-types.handler';
import { ListAreasHandler } from './application/handlers/list-areas.handler';
import { GetAreaHandler } from './application/handlers/get-area.handler';
import { CreateAreaTypeHandler } from './application/handlers/create-area-type.handler';
import { UpdateAreaTypeHandler } from './application/handlers/update-area-type.handler';
import { CreateAreaHandler } from './application/handlers/create-area.handler';
import { UpdateAreaHandler } from './application/handlers/update-area.handler';

@Module({
  imports: [
    CqrsModule,
    RecordCodesModule,
    TypeOrmModule.forFeature([OperationArea, OperationAreaType]),
  ],
  controllers: [TerritoryController],
  providers: [
    { provide: TERRITORY_REPOSITORY, useClass: TypeOrmTerritoryRepository },
    OperationAreaGeometryService,
    ListAreaTypesHandler,
    ListAreasHandler,
    GetAreaHandler,
    CreateAreaTypeHandler,
    UpdateAreaTypeHandler,
    CreateAreaHandler,
    UpdateAreaHandler,
  ],
  exports: [TypeOrmModule, TERRITORY_REPOSITORY, OperationAreaGeometryService],
})
export class TerritoryModule {}
