import {
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePeriodDocumentCommand } from '../commands/update-period-document.command';
import {
  CONTRACTS_REPOSITORY,
  ContractsRepositoryPort,
} from '../ports/contracts.repository.port';
import {
  assertItsOrDireccion,
  computePeriodStatusFromDocs,
} from '../helpers/period-status';

const DOC_STATUSES = new Set([
  'missing',
  'received',
  'approved',
  'rejected',
]);

@CommandHandler(UpdatePeriodDocumentCommand)
export class UpdatePeriodDocumentHandler
  implements ICommandHandler<UpdatePeriodDocumentCommand>
{
  constructor(
    @Inject(CONTRACTS_REPOSITORY)
    private readonly repo: ContractsRepositoryPort,
  ) {}

  async execute(cmd: UpdatePeriodDocumentCommand) {
    assertItsOrDireccion(cmd.actorRole);
    if (!DOC_STATUSES.has(cmd.status)) {
      throw new BadRequestException(`status inválido: ${cmd.status}`);
    }
    const period = await this.repo.findPeriodById(cmd.periodId);
    if (!period) throw new NotFoundException('Período no encontrado');
    if (period.status === 'certified') {
      throw new BadRequestException('El período ya está certificado');
    }

    const doc = await this.repo.findDocument(cmd.periodId, cmd.docType);
    if (!doc) throw new NotFoundException(`Documento ${cmd.docType} no existe`);

    doc.status = cmd.status;
    if (cmd.notes !== undefined) doc.notes = cmd.notes;
    await this.repo.saveDocument(doc);

    const refreshed = await this.repo.findPeriodById(cmd.periodId);
    if (refreshed) {
      refreshed.status = computePeriodStatusFromDocs(
        refreshed.documents ?? [],
        refreshed.status,
      );
      await this.repo.savePeriod(refreshed);
    }

    return {
      docType: doc.docType,
      status: doc.status,
      periodStatus: refreshed?.status,
    };
  }
}
