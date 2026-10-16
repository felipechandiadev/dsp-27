import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordCodesModule } from '@modules/record-codes/record-codes.module';
import { MultimediaModule } from '@modules/multimedia/multimedia.module';
import { DocumentType } from './domain/document-type.entity';
import { ManagedDocument } from './domain/managed-document.entity';
import { DOCUMENT_TYPES_REPOSITORY } from './application/ports/document-types.repository.port';
import { MANAGED_DOCUMENTS_REPOSITORY } from './application/ports/managed-documents.repository.port';
import { TypeOrmDocumentTypesRepository } from './infrastructure/typeorm-document-types.repository';
import { TypeOrmManagedDocumentsRepository } from './infrastructure/typeorm-managed-documents.repository';
import { DocumentTypesController } from './presentation/document-types.controller';
import { ManagedDocumentsController } from './presentation/managed-documents.controller';
import { ListDocumentTypesHandler } from './application/handlers/list-document-types.handler';
import { CreateDocumentTypeHandler } from './application/handlers/create-document-type.handler';
import { UpdateDocumentTypeHandler } from './application/handlers/update-document-type.handler';
import { ListManagedDocumentsHandler } from './application/handlers/list-managed-documents.handler';
import { GetManagedDocumentHandler } from './application/handlers/get-managed-document.handler';
import { CreateManagedDocumentHandler } from './application/handlers/create-managed-document.handler';
import { UpdateManagedDocumentHandler } from './application/handlers/update-managed-document.handler';
import { UploadManagedDocumentBodyHandler } from './application/handlers/upload-managed-document-body.handler';

@Module({
  imports: [
    CqrsModule,
    RecordCodesModule,
    MultimediaModule,
    TypeOrmModule.forFeature([DocumentType, ManagedDocument]),
  ],
  controllers: [DocumentTypesController, ManagedDocumentsController],
  providers: [
    {
      provide: DOCUMENT_TYPES_REPOSITORY,
      useClass: TypeOrmDocumentTypesRepository,
    },
    {
      provide: MANAGED_DOCUMENTS_REPOSITORY,
      useClass: TypeOrmManagedDocumentsRepository,
    },
    ListDocumentTypesHandler,
    CreateDocumentTypeHandler,
    UpdateDocumentTypeHandler,
    ListManagedDocumentsHandler,
    GetManagedDocumentHandler,
    CreateManagedDocumentHandler,
    UpdateManagedDocumentHandler,
    UploadManagedDocumentBodyHandler,
  ],
  exports: [
    TypeOrmModule,
    DOCUMENT_TYPES_REPOSITORY,
    MANAGED_DOCUMENTS_REPOSITORY,
  ],
})
export class DocumentsModule {}
