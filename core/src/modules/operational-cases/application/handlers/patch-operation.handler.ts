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
import { attachLocationGeometry } from '../helpers/ops-location.helper';
import { CaseLocationGeometryService } from '../case-location-geometry.service';

const PRIORITIES = new Set(['P0', 'P1', 'P2', 'P3']);
const TERMINAL = new Set(['finalizada', 'cancelada', 'fallida']);

@CommandHandler(PatchOperationCommand)
export class PatchOperationHandler
  implements ICommandHandler<PatchOperationCommand>
{
  constructor(
    @Inject(OPERATIONAL_CASES_REPOSITORY)
    private readonly repo: OperationalCasesRepositoryPort,
    private readonly locationGeom: CaseLocationGeometryService,
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

    const { briefing, prioridad, locationGeometry } = cmd.input;
    if (
      briefing === undefined &&
      prioridad === undefined &&
      locationGeometry === undefined
    ) {
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
    if (locationGeometry !== undefined) {
      if (locationGeometry != null) {
        this.locationGeom.validate(locationGeometry);
      }
      await this.locationGeom.write(
        'field_operations',
        row.id,
        locationGeometry,
      );
    }

    const saved = await this.repo.saveOperation(row);
    const full = await this.repo.findOperationById(saved.id);
    return attachLocationGeometry(
      this.locationGeom,
      'field_operations',
      mapFieldOperation(full!),
    );
  }
}
