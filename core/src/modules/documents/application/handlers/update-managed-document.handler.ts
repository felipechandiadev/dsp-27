import {
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateManagedDocumentCommand } from '../commands/update-managed-document.command';
import {
  MANAGED_DOCUMENTS_REPOSITORY,
  ManagedDocumentsRepositoryPort,
} from '../ports/managed-documents.repository.port';
import { assertDocumentTypesWriteRole } from '../helpers/document-types-access';
import { mapManagedDocument } from '../helpers/managed-document.mapper';

const STATUSES = new Set(['draft', 'published']);

@CommandHandler(UpdateManagedDocumentCommand)
export class UpdateManagedDocumentHandler
  implements ICommandHandler<UpdateManagedDocumentCommand>
{
  constructor(
    @Inject(MANAGED_DOCUMENTS_REPOSITORY)
    private readonly repo: ManagedDocumentsRepositoryPort,
  ) {}

  async execute(cmd: UpdateManagedDocumentCommand) {
    assertDocumentTypesWriteRole(cmd.actorRole);
    const row = await this.repo.findByCode(cmd.code);
    if (!row) {
      throw new NotFoundException(`Documento ${cmd.code} no encontrado`);
    }

    const { input } = cmd;
    if (input.title !== undefined) {
      const title = input.title.trim();
      if (!title) throw new BadRequestException('title no puede ser vacío');
      row.title = title;
    }

    if (input.documentTypeCode !== undefined) {
      if (input.documentTypeCode == null || input.documentTypeCode === '') {
        row.documentTypeId = null;
      } else {
        const id = await this.repo.findDocumentTypeIdByCode(
          input.documentTypeCode,
        );
        if (!id) {
          throw new BadRequestException(
            `documentTypeCode inválido: ${input.documentTypeCode}`,
          );
        }
        row.documentTypeId = id;
      }
    } else if (input.documentTypeId !== undefined) {
      row.documentTypeId = input.documentTypeId;
    }

    if (input.status !== undefined) {
      if (!STATUSES.has(input.status)) {
        throw new BadRequestException('status inválido');
      }
      row.status = input.status;
    }

    if (input.bodyJson !== undefined) {
      row.bodyJson = input.bodyJson ?? {};
    }
    if (input.bodyHtml !== undefined) {
      row.bodyHtml = input.bodyHtml;
    }
    if (input.bodyAssetId !== undefined) {
      row.bodyAssetId = input.bodyAssetId;
    }

    await this.repo.save(row);
    const full = await this.repo.findByCode(row.code);
    return mapManagedDocument(full ?? row);
  }
}
