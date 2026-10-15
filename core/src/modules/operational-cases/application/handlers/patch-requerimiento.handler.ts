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
import { attachLocationGeometry } from '../helpers/ops-location.helper';
import { CaseLocationGeometryService } from '../case-location-geometry.service';

const PRIORITIES = new Set(['P0', 'P1', 'P2', 'P3']);

@CommandHandler(PatchRequerimientoCommand)
export class PatchRequerimientoHandler
  implements ICommandHandler<PatchRequerimientoCommand>
{
  constructor(
    @Inject(OPERATIONAL_CASES_REPOSITORY)
    private readonly repo: OperationalCasesRepositoryPort,
    private readonly locationGeom: CaseLocationGeometryService,
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

    const {
      descripcion,
      prioridad,
      locationDescription,
      lat,
      lng,
      locationGeometry,
    } = cmd.input;
    if (
      descripcion === undefined &&
      prioridad === undefined &&
      locationDescription === undefined &&
      lat === undefined &&
      lng === undefined &&
      locationGeometry === undefined
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

    if (locationGeometry !== undefined) {
      if (locationGeometry != null) {
        this.locationGeom.validate(locationGeometry);
      }
      const coords = this.locationGeom.coordsFromGeometry(locationGeometry);
      row.lat = coords.lat;
      row.lng = coords.lng;
      await this.locationGeom.write(
        'requerimientos',
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
        await this.locationGeom.write('requerimientos', row.id, point);
      } else {
        row.lat = null;
        row.lng = null;
        await this.locationGeom.write('requerimientos', row.id, null);
      }
    }

    const saved = await this.repo.saveRequerimiento(row);
    const full = await this.repo.findRequerimientoById(saved.id);
    return attachLocationGeometry(
      this.locationGeom,
      'requerimientos',
      mapRequerimiento(full!),
    );
  }
}
