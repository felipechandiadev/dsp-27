import {
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PatchOperationCommand } from '../commands/patch-operation.command';
import {
  OPERATIONAL_CASES_REPOSITORY,
  OperationalCasesRepositoryPort,
} from '../ports/operational-cases.repository.port';
import { assertDeployOperationRole } from '../helpers/ops-access';
import { mapFieldOperation } from '../helpers/ops.mapper';

const PRIORITIES = new Set(['P0', 'P1', 'P2', 'P3']);
const TERMINAL = new Set(['finalizada', 'cancelada', 'fallida']);

@CommandHandler(PatchOperationCommand)
export class PatchOperationHandler
  implements ICommandHandler<PatchOperationCommand>
{
  constructor(
    @Inject(OPERATIONAL_CASES_REPOSITORY)
    private readonly repo: OperationalCasesRepositoryPort,
  ) {}

  async execute(cmd: PatchOperationCommand) {
    assertDeployOperationRole(cmd.actorRole);
    const row = await this.repo.findOperationByCode(cmd.code);
    if (!row) throw new NotFoundException('Operación no encontrada');
    if (TERMINAL.has(row.status)) {
      throw new BadRequestException(
        'No se puede editar una operación finalizada',
      );
    }

    const { briefing, prioridad } = cmd.input;
    if (briefing === undefined && prioridad === undefined) {
      throw new BadRequestException('Sin campos para actualizar');
    }

    if (briefing !== undefined) {
      row.briefing =
        briefing == null || !String(briefing).trim()
          ? null
          : String(briefing).trim();
    }
    if (prioridad !== undefined) {
      if (!PRIORITIES.has(prioridad)) {
        throw new BadRequestException('prioridad inválida');
      }
      row.prioridad = prioridad;
    }

    const saved = await this.repo.saveOperation(row);
    const full = await this.repo.findOperationById(saved.id);
    return mapFieldOperation(full!);
  }
}
