import {
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PatchIncidenciaCommand } from '../commands/patch-incidencia.command';
import {
  OPERATIONAL_CASES_REPOSITORY,
  OperationalCasesRepositoryPort,
} from '../ports/operational-cases.repository.port';
import { assertCreateCaseRole } from '../helpers/ops-access';
import { mapIncidencia } from '../helpers/ops.mapper';

@CommandHandler(PatchIncidenciaCommand)
export class PatchIncidenciaHandler
  implements ICommandHandler<PatchIncidenciaCommand>
{
  constructor(
    @Inject(OPERATIONAL_CASES_REPOSITORY)
    private readonly repo: OperationalCasesRepositoryPort,
  ) {}

  async execute(cmd: PatchIncidenciaCommand) {
    assertCreateCaseRole(cmd.actorRole);
    const row = await this.repo.findIncidenciaByCode(cmd.code);
    if (!row) throw new NotFoundException('Incidencia no encontrada');

    const { title, descripcion, incidentTypeId, locationDescription } =
      cmd.input;
    if (
      title === undefined &&
      descripcion === undefined &&
      incidentTypeId === undefined &&
      locationDescription === undefined
    ) {
      throw new BadRequestException('Sin campos para actualizar');
    }

    if (title !== undefined) {
      const trimmed = title.trim();
      if (!trimmed) throw new BadRequestException('title es requerido');
      row.title = trimmed;
    }
    if (descripcion !== undefined) {
      row.descripcion =
        descripcion == null || !String(descripcion).trim()
          ? null
          : String(descripcion).trim();
    }
    if (incidentTypeId !== undefined) {
      if (incidentTypeId === null) {
        row.incidentTypeId = null;
      } else {
        const t = await this.repo.findIncidentTypeById(incidentTypeId);
        if (!t || t.status !== 'active') {
          throw new NotFoundException('Tipo de incidencia no encontrado');
        }
        row.incidentTypeId = incidentTypeId;
      }
    }
    if (locationDescription !== undefined) {
      row.locationDescription =
        locationDescription == null || !String(locationDescription).trim()
          ? null
          : String(locationDescription).trim();
    }

    const saved = await this.repo.saveIncidencia(row);
    const full = await this.repo.findIncidenciaById(saved.id);
    return mapIncidencia(full!);
  }
}
