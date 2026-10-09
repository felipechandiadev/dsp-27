import {
  BadRequestException,
  ConflictException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OpenPeriodCommand } from '../commands/open-period.command';
import {
  CONTRACTS_REPOSITORY,
  ContractsRepositoryPort,
} from '../ports/contracts.repository.port';
import { assertItsOrDireccion } from '../helpers/period-status';
import { checklistForKind } from '@modules/contracts/domain/contract-kinds';

function lastDayOfMonth(year: number, month: number): string {
  const d = new Date(Date.UTC(year, month, 0));
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${d.getUTCFullYear()}-${mm}-${dd}`;
}

@CommandHandler(OpenPeriodCommand)
export class OpenPeriodHandler implements ICommandHandler<OpenPeriodCommand> {
  constructor(
    @Inject(CONTRACTS_REPOSITORY)
    private readonly repo: ContractsRepositoryPort,
  ) {}

  async execute(cmd: OpenPeriodCommand) {
    assertItsOrDireccion(cmd.actorRole);
    if (cmd.month < 1 || cmd.month > 12) {
      throw new BadRequestException('month debe ser 1–12');
    }
    const contract = await this.repo.findContractByCode(cmd.contractCode);
    if (!contract) {
      throw new NotFoundException(`Contrato ${cmd.contractCode} no encontrado`);
    }
    const existing = await this.repo.findPeriod(
      contract.id,
      cmd.year,
      cmd.month,
    );
    if (existing) {
      throw new ConflictException('El período ya está abierto');
    }

    const period = await this.repo.savePeriod(
      this.repo.createPeriod({
        contractId: contract.id,
        year: cmd.year,
        month: cmd.month,
        status: 'open',
        docsDueOn: lastDayOfMonth(cmd.year, cmd.month),
        certifiedAt: null,
        certificationNotes: null,
      }),
    );

    const types = checklistForKind(contract.kind);
    await this.repo.saveDocuments(
      types.map((docType) =>
        this.repo.createDocument({
          periodId: period.id,
          docType,
          status: 'missing',
          notes: null,
        }),
      ),
    );

    return { id: period.id, year: period.year, month: period.month };
  }
}
