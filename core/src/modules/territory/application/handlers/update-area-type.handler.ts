import {
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateAreaTypeCommand } from '../commands/update-area-type.command';
import {
  TERRITORY_REPOSITORY,
  TerritoryRepositoryPort,
} from '../ports/territory.repository.port';
import { assertTerritoryWriteRole } from '../helpers/territory-access';
import { mapAreaType } from '../helpers/area.mapper';

const STATUSES = new Set(['active', 'inactive']);

@CommandHandler(UpdateAreaTypeCommand)
export class UpdateAreaTypeHandler
  implements ICommandHandler<UpdateAreaTypeCommand>
{
  constructor(
    @Inject(TERRITORY_REPOSITORY)
    private readonly repo: TerritoryRepositoryPort,
  ) {}

  async execute(cmd: UpdateAreaTypeCommand) {
    assertTerritoryWriteRole(cmd.actorRole);
    const row = await this.repo.findTypeById(cmd.id);
    if (!row) {
      throw new NotFoundException('Tipo de área no encontrado');
    }
    const { input } = cmd;
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw new BadRequestException('name vacío');
      row.name = name;
    }
    if (input.description !== undefined) {
      row.description = input.description?.trim() || null;
    }
    if (input.color !== undefined) {
      row.color = input.color?.trim() || null;
    }
    if (input.sortOrder !== undefined) {
      row.sortOrder = input.sortOrder;
    }
    if (input.status !== undefined) {
      if (!STATUSES.has(input.status)) {
        throw new BadRequestException('status debe ser active o inactive');
      }
      row.status = input.status;
    }
    const saved = await this.repo.saveType(row);
    return mapAreaType(saved);
  }
}
