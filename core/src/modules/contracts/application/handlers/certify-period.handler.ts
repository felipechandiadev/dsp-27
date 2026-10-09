import {
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CertifyPeriodCommand } from '../commands/certify-period.command';
import {
  CONTRACTS_REPOSITORY,
  ContractsRepositoryPort,
} from '../ports/contracts.repository.port';
import { assertItsOrDireccion, canCertify } from '../helpers/period-status';

@CommandHandler(CertifyPeriodCommand)
export class CertifyPeriodHandler
  implements ICommandHandler<CertifyPeriodCommand>
{
  constructor(
    @Inject(CONTRACTS_REPOSITORY)
    private readonly repo: ContractsRepositoryPort,
  ) {}

  async execute(cmd: CertifyPeriodCommand) {
    assertItsOrDireccion(cmd.actorRole);
    const period = await this.repo.findPeriodById(cmd.periodId);
    if (!period) throw new NotFoundException('Período no encontrado');
    if (period.status === 'certified') {
      throw new BadRequestException('El período ya está certificado');
    }
    if (!canCertify(period.documents ?? [])) {
      throw new BadRequestException(
        'Todos los documentos deben estar received o approved',
      );
    }

    period.status = 'certified';
    period.certifiedAt = new Date();
    period.certificationNotes = cmd.notes ?? null;
    await this.repo.savePeriod(period);

    return {
      id: period.id,
      status: period.status,
      certifiedAt: period.certifiedAt,
    };
  }
}
