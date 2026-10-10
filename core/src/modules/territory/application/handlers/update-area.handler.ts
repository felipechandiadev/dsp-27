import {
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateAreaCommand } from '../commands/update-area.command';
import {
  TERRITORY_REPOSITORY,
  TerritoryRepositoryPort,
} from '../ports/territory.repository.port';
import { assertTerritoryWriteRole } from '../helpers/territory-access';
import { OperationAreaGeometryService } from '../operation-area-geometry.service';
import { mapArea } from '../helpers/area.mapper';

const STATUSES = new Set(['active', 'inactive']);

@CommandHandler(UpdateAreaCommand)
export class UpdateAreaHandler implements ICommandHandler<UpdateAreaCommand> {
  constructor(
    @Inject(TERRITORY_REPOSITORY)
    private readonly repo: TerritoryRepositoryPort,
    private readonly geometry: OperationAreaGeometryService,
  ) {}

  async execute(cmd: UpdateAreaCommand) {
    assertTerritoryWriteRole(cmd.actorRole);
    const row = await this.repo.findAreaByCode(cmd.code);
    if (!row) {
      throw new NotFoundException(`Área no encontrada: ${cmd.code}`);
    }

    const { input } = cmd;
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw new BadRequestException('name vacío');
      row.name = name;
    }
    if (input.typeId !== undefined) {
      const type = await this.repo.findTypeById(input.typeId);
      if (!type) {
        throw new NotFoundException('Tipo de área no encontrado');
      }
      row.typeId = type.id;
    }
    if (input.parentId !== undefined) {
      if (input.parentId === row.id) {
        throw new BadRequestException('Un área no puede ser padre de sí misma');
      }
      if (input.parentId) {
        const parent = await this.repo.findAreaById(input.parentId);
        if (!parent) {
          throw new NotFoundException('Área padre no encontrada');
        }
      }
      row.parentId = input.parentId;
    }
    if (input.notes !== undefined) {
      row.notes = input.notes?.trim() || null;
    }
    if (input.status !== undefined) {
      if (!STATUSES.has(input.status)) {
        throw new BadRequestException('status debe ser active o inactive');
      }
      row.status = input.status;
    }

    await this.repo.saveArea(row);

    if (input.geometry) {
      await this.geometry.writeGeometry(row.id, input.geometry);
    }

    const fresh = await this.repo.findAreaById(row.id);
    const geom = await this.geometry.readGeometry(row.id);
    return mapArea(fresh!, geom);
  }
}
