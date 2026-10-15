import {
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateDocumentTypeCommand } from '../commands/update-document-type.command';
import {
  DOCUMENT_TYPES_REPOSITORY,
  DocumentTypesRepositoryPort,
} from '../ports/document-types.repository.port';
import { assertDocumentTypesWriteRole } from '../helpers/document-types-access';
import { mapDocumentType } from '../helpers/document-type.mapper';

const STATUSES = new Set(['active', 'inactive']);

@CommandHandler(UpdateDocumentTypeCommand)
export class UpdateDocumentTypeHandler
  implements ICommandHandler<UpdateDocumentTypeCommand>
{
  constructor(
    @Inject(DOCUMENT_TYPES_REPOSITORY)
    private readonly repo: DocumentTypesRepositoryPort,
  ) {}

  async execute(cmd: UpdateDocumentTypeCommand) {
    assertDocumentTypesWriteRole(cmd.actorRole);
    const row = await this.repo.findByCode(cmd.code);
    if (!row) {
      throw new NotFoundException('Tipo de documento no encontrado');
    }
    const { input } = cmd;
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw new BadRequestException('name vacío');
      row.name = name;
    }
    if (input.description !== undefined) {
      row.description =
        input.description == null || !String(input.description).trim()
          ? null
          : String(input.description).trim();
    }
    if (input.sortOrder !== undefined) {
      row.sortOrder = input.sortOrder;
    }
    if (input.status !== undefined) {
      if (!STATUSES.has(input.status)) {
        throw new BadRequestException('status debe ser active o inactive');
      }
      row.status = input.status;
    }
    const saved = await this.repo.save(row);
    return mapDocumentType(saved);
  }
}
