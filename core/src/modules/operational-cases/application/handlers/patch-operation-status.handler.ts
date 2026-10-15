import {
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PatchOperationStatusCommand } from '../commands/patch-operation-status.command';
import {
  OPERATIONAL_CASES_REPOSITORY,
  OperationalCasesRepositoryPort,
} from '../ports/operational-cases.repository.port';
import { assertDeployOperationRole } from '../helpers/ops-access';
import { mapFieldOperation } from '../helpers/ops.mapper';
import { attachLocationGeometry } from '../helpers/ops-location.helper';
import { CaseLocationGeometryService } from '../case-location-geometry.service';

const NEXT: Record<string, string[]> = {
  asignada: ['en_traslado', 'ejecutando', 'cancelada'],
  en_traslado: ['ejecutando', 'cancelada', 'fallida'],
  ejecutando: ['finalizada', 'cancelada', 'fallida'],
  finalizada: [],
  cancelada: [],
  fallida: [],
};

@CommandHandler(PatchOperationStatusCommand)
export class PatchOperationStatusHandler
  implements ICommandHandler<PatchOperationStatusCommand>
{
  constructor(
    @Inject(OPERATIONAL_CASES_REPOSITORY)
    private readonly repo: OperationalCasesRepositoryPort,
    private readonly locationGeom: CaseLocationGeometryService,
  ) {}

  async execute(cmd: PatchOperationStatusCommand) {
    assertDeployOperationRole(cmd.actorRole);
    const row = await this.repo.findOperationByCode(cmd.code);
    if (!row) throw new NotFoundException('Operación no encontrada');
    const allowed = NEXT[row.status] ?? [];
    if (!allowed.includes(cmd.status)) {
      throw new BadRequestException(
        `Transición ${row.status} → ${cmd.status} no permitida`,
      );
    }
    row.status = cmd.status;
    const saved = await this.repo.saveOperation(row);
    const full = await this.repo.findOperationById(saved.id);
    return attachLocationGeometry(
      this.locationGeom,
      'field_operations',
      mapFieldOperation(full!),
    );
  }
}
