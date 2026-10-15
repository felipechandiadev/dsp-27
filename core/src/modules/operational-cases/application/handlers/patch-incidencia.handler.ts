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
import { attachLocationGeometry } from '../helpers/ops-location.helper';
import { CaseLocationGeometryService } from '../case-location-geometry.service';

@CommandHandler(PatchIncidenciaCommand)
export class PatchIncidenciaHandler
  implements ICommandHandler<PatchIncidenciaCommand>
{
  constructor(
    @Inject(OPERATIONAL_CASES_REPOSITORY)
    private readonly repo: OperationalCasesRepositoryPort,
    private readonly locationGeom: CaseLocationGeometryService,
  ) {}

  async execute(cmd: PatchIncidenciaCommand) {
    assertCreateCaseRole(cmd.actorRole);
    const row = await this.repo.findIncidenciaByCode(cmd.code);
    if (!row) throw new NotFoundException('Incidencia no encontrada');

    const {
      title,
      descripcion,
      incidentTypeId,
      locationDescription,
      lat,
      lng,
      locationGeometry,
    } = cmd.input;
    if (
      title === undefined &&
      descripcion === undefined &&
      incidentTypeId === undefined &&
      locationDescription === undefined &&
      lat === undefined &&
      lng === undefined &&
      locationGeometry === undefined
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

    if (locationGeometry !== undefined) {
      if (locationGeometry != null) {
        this.locationGeom.validate(locationGeometry);
      }
      const coords = this.locationGeom.coordsFromGeometry(locationGeometry);
      row.lat = coords.lat;
      row.lng = coords.lng;
      await this.locationGeom.write(
        'incidencias',
        row.id,
        locationGeometry,
      );
    } else if (lat !== undefined || lng !== undefined) {
      const nextLat = lat !== undefined ? lat : row.lat;
      const nextLng = lng !== undefined ? lng : row.lng;
      if (nextLat != null && nextLng != null) {
        const point = this.locationGeom.pointFromLatLng(nextLat, nextLng);
        row.lat = nextLat;
        row.lng = nextLng;
        await this.locationGeom.write('incidencias', row.id, point);
      } else {
        row.lat = null;
        row.lng = null;
        await this.locationGeom.write('incidencias', row.id, null);
      }
    }

    const saved = await this.repo.saveIncidencia(row);
    const full = await this.repo.findIncidenciaById(saved.id);
    return attachLocationGeometry(
      this.locationGeom,
      'incidencias',
      mapIncidencia(full!),
    );
  }
}
