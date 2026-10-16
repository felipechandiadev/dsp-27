import { BadRequestException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateDocumentTypeCommand } from '../commands/create-document-type.command';
import {
  DOCUMENT_TYPES_REPOSITORY,
  DocumentTypesRepositoryPort,
} from '../ports/document-types.repository.port';
import { assertDocumentTypesWriteRole } from '../helpers/document-types-access';
import { mapDocumentType } from '../helpers/document-type.mapper';
import { RecordCodeService } from '@modules/record-codes/application/record-code.service';

@CommandHandler(CreateDocumentTypeCommand)
export class CreateDocumentTypeHandler
  implements ICommandHandler<CreateDocumentTypeCommand>
{
  constructor(
    @Inject(DOCUMENT_TYPES_REPOSITORY)
    private readonly repo: DocumentTypesRepositoryPort,
    private readonly recordCodes: RecordCodeService,
  ) {}

  async execute(cmd: CreateDocumentTypeCommand) {
    assertDocumentTypesWriteRole(cmd.actorRole);
    const name = cmd.input.name?.trim() ?? '';
    if (!name) {
      throw new BadRequestException('name es requerido');
    }
    const creationMode = cmd.input.creationMode ?? 'attachment';
    if (creationMode !== 'composed' && creationMode !== 'attachment') {
      throw new BadRequestException(
        'creationMode debe ser composed o attachment',
      );
    }
    const code = await this.recordCodes.next('DTY');
    const row = this.repo.create({
      code,
      name,
      description: cmd.input.description?.trim() || null,
      sortOrder: cmd.input.sortOrder ?? 0,
      status: 'active',
      creationMode,
    });
    const saved = await this.repo.save(row);
    return mapDocumentType(saved);
  }
}
