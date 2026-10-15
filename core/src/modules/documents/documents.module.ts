import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordCodesModule } from '@modules/record-codes/record-codes.module';
import { DocumentType } from './domain/document-type.entity';
import { DOCUMENT_TYPES_REPOSITORY } from './application/ports/document-types.repository.port';
import { TypeOrmDocumentTypesRepository } from './infrastructure/typeorm-document-types.repository';
import { DocumentTypesController } from './presentation/document-types.controller';
import { ListDocumentTypesHandler } from './application/handlers/list-document-types.handler';
import { CreateDocumentTypeHandler } from './application/handlers/create-document-type.handler';
import { UpdateDocumentTypeHandler } from './application/handlers/update-document-type.handler';

@Module({
  imports: [
    CqrsModule,
    RecordCodesModule,
    TypeOrmModule.forFeature([DocumentType]),
  ],
  controllers: [DocumentTypesController],
  providers: [
    {
      provide: DOCUMENT_TYPES_REPOSITORY,
      useClass: TypeOrmDocumentTypesRepository,
    },
    ListDocumentTypesHandler,
    CreateDocumentTypeHandler,
    UpdateDocumentTypeHandler,
  ],
  exports: [TypeOrmModule, DOCUMENT_TYPES_REPOSITORY],
})
export class DocumentsModule {}
