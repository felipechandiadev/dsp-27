import {
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PatchRequerimientoCommand } from '../commands/patch-requerimiento.command';
import {
  OPERATIONAL_CASES_REPOSITORY,
  OperationalCasesRepositoryPort,
} from '../ports/operational-cases.repository.port';
import { assertCreateCaseRole } from '../helpers/ops-access';
import { mapRequerimiento } from '../helpers/ops.mapper';

const PRIORITIES = new Set(['P0', 'P1', 'P2', 'P3']);

@CommandHandler(PatchRequerimientoCommand)
export class PatchRequerimientoHandler
  implements ICommandHandler<PatchRequerimientoCommand>
{
  constructor(
    @Inject(OPERATIONAL_CASES_REPOSITORY)
    private readonly repo: OperationalCasesRepositoryPort,
  ) {}

  async execute(cmd: PatchRequerimientoCommand) {
    assertCreateCaseRole(cmd.actorRole);
    const row = await this.repo.findRequerimientoByCode(cmd.code);
    if (!row) throw new NotFoundException('Requerimiento no encontrado');
    if (row.closedAt) {
      throw new BadRequestException(
        'No se puede editar un requerimiento cerrado',
      );
    }

    const { descripcion, prioridad, locationDescription } = cmd.input;
    if (
      descripcion === undefined &&
      prioridad === undefined &&
      locationDescription === undefined
    ) {
      throw new BadRequestException('Sin campos para actualizar');
    }

    if (descripcion !== undefined) {
      const trimmed = descripcion.trim();
      if (!trimmed) throw new BadRequestException('descripcion es requerida');
      row.descripcion = trimmed;
    }
    if (prioridad !== undefined) {
      if (!PRIORITIES.has(prioridad)) {
        throw new BadRequestException('prioridad inválida');
      }
      row.prioridad = prioridad;
    }
    if (locationDescription !== undefined) {
      row.locationDescription =
        locationDescription == null || !String(locationDescription).trim()
          ? null
          : String(locationDescription).trim();
    }

    const saved = await this.repo.saveRequerimiento(row);
    const full = await this.repo.findRequerimientoById(saved.id);
    return mapRequerimiento(full!);
  }
}
