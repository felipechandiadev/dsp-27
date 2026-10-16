import { BadRequestException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateManagedDocumentCommand } from '../commands/create-managed-document.command';
import {
  MANAGED_DOCUMENTS_REPOSITORY,
  ManagedDocumentsRepositoryPort,
} from '../ports/managed-documents.repository.port';
import { assertDocumentTypesWriteRole } from '../helpers/document-types-access';
import { mapManagedDocument } from '../helpers/managed-document.mapper';
import { RecordCodeService } from '@modules/record-codes/application/record-code.service';

const STATUSES = new Set(['draft', 'published']);

@CommandHandler(CreateManagedDocumentCommand)
export class CreateManagedDocumentHandler
  implements ICommandHandler<CreateManagedDocumentCommand>
{
  constructor(
    @Inject(MANAGED_DOCUMENTS_REPOSITORY)
    private readonly repo: ManagedDocumentsRepositoryPort,
    private readonly recordCodes: RecordCodeService,
  ) {}

  async execute(cmd: CreateManagedDocumentCommand) {
    assertDocumentTypesWriteRole(cmd.actorRole);
    const title = cmd.input.title?.trim() ?? '';
    if (!title) {
      throw new BadRequestException('title es requerido');
    }

    let documentTypeId = cmd.input.documentTypeId ?? null;
    if (!documentTypeId && cmd.input.documentTypeCode) {
      documentTypeId = await this.repo.findDocumentTypeIdByCode(
        cmd.input.documentTypeCode,
      );
      if (!documentTypeId) {
        throw new BadRequestException(
          `documentTypeCode inválido: ${cmd.input.documentTypeCode}`,
        );
      }
    }

    const status = cmd.input.status ?? 'draft';
    if (!STATUSES.has(status)) {
      throw new BadRequestException('status inválido');
    }

    const code = await this.recordCodes.next('DOC');
    const row = this.repo.create({
      code,
      title,
      documentTypeId,
      status,
      bodyJson: cmd.input.bodyJson ?? {},
      bodyHtml: cmd.input.bodyHtml ?? null,
      bodyAssetId: cmd.input.bodyAssetId ?? null,
      createdByUserId: cmd.actorUserId,
    });
    const saved = await this.repo.save(row);
    const full = await this.repo.findByCode(saved.code);
    return mapManagedDocument(full ?? saved);
  }
}
