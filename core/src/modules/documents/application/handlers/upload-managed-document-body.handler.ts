import {
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MultimediaService } from '@modules/multimedia/application/multimedia.service';
import { UploadManagedDocumentBodyCommand } from '../commands/upload-managed-document-body.command';
import {
  MANAGED_DOCUMENTS_REPOSITORY,
  ManagedDocumentsRepositoryPort,
} from '../ports/managed-documents.repository.port';
import { assertDocumentTypesWriteRole } from '../helpers/document-types-access';
import { mapManagedDocument } from '../helpers/managed-document.mapper';

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

@CommandHandler(UploadManagedDocumentBodyCommand)
export class UploadManagedDocumentBodyHandler
  implements ICommandHandler<UploadManagedDocumentBodyCommand>
{
  constructor(
    @Inject(MANAGED_DOCUMENTS_REPOSITORY)
    private readonly repo: ManagedDocumentsRepositoryPort,
    private readonly multimedia: MultimediaService,
  ) {}

  async execute(cmd: UploadManagedDocumentBodyCommand) {
    assertDocumentTypesWriteRole(cmd.actorRole);
    const row = await this.repo.findByCode(cmd.code);
    if (!row) {
      throw new NotFoundException(`Documento ${cmd.code} no encontrado`);
    }

    const mime = cmd.file.mimeType || DOCX_MIME;
    if (
      mime !== DOCX_MIME &&
      mime !== 'application/msword' &&
      !cmd.file.originalName.toLowerCase().endsWith('.docx')
    ) {
      throw new BadRequestException('El cuerpo debe ser un archivo .docx');
    }

    const asset = await this.multimedia.upload({
      entityType: 'managed_document',
      entityId: row.id,
      kind: 'document',
      mimeType: mime === 'application/msword' ? mime : DOCX_MIME,
      originalName: cmd.file.originalName.endsWith('.docx')
        ? cmd.file.originalName
        : `${row.code}.docx`,
      buffer: cmd.file.buffer,
      classification: 'body_docx',
      uploadedByUserId: cmd.actorUserId,
      replaceDocuments: true,
    });

    row.bodyAssetId = asset.id;
    await this.repo.save(row);
    const full = await this.repo.findByCode(row.code);
    return mapManagedDocument(full ?? row);
  }
}
