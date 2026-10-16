import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateSubtaskCommand } from '../commands/update-subtask.command';
import {
  PORTFOLIO_REPOSITORY,
  PortfolioRepositoryPort,
} from '../ports/portfolio.repository.port';
import {
  assertDateRange,
  resolveStrategicObjectives,
} from '../helpers/strategic-objectives.helper';
import { mapSubtask } from '../helpers/subtask.mapper';

@CommandHandler(UpdateSubtaskCommand)
export class UpdateSubtaskHandler
  implements ICommandHandler<UpdateSubtaskCommand>
{
  constructor(
    @Inject(PORTFOLIO_REPOSITORY)
    private readonly portfolio: PortfolioRepositoryPort,
  ) {}

  async execute(cmd: UpdateSubtaskCommand) {
    const row = await this.portfolio.findSubtaskWithObjectives(cmd.subtaskId);
    if (!row) throw new NotFoundException('Subtarea no encontrada');

    const input = cmd.input;
    if (input.title !== undefined) {
      const trimmed = input.title.trim();
      if (!trimmed) throw new BadRequestException('title no puede estar vacío');
      row.title = trimmed;
    }
    if (input.description !== undefined) {
      row.description = input.description?.trim() || null;
    }
    if (input.objectiveText !== undefined) {
      row.objectiveText = input.objectiveText?.trim() || null;
    }
    if (input.status !== undefined) {
      row.status = input.status.trim() || 'pending';
    }
    if (input.startsOn !== undefined) row.startsOn = input.startsOn;
    if (input.endsOn !== undefined) row.endsOn = input.endsOn;
    assertDateRange(row.startsOn, row.endsOn);
    if (input.sortOrder !== undefined) row.sortOrder = input.sortOrder;

    if (input.strategicObjectiveIds !== undefined) {
      row.strategicObjectives =
        (await resolveStrategicObjectives(
          this.portfolio,
          input.strategicObjectiveIds,
        )) ?? [];
    }

    await this.portfolio.saveSubtask(row);
    const full = await this.portfolio.findSubtaskWithObjectives(row.id);
    return mapSubtask(full!);
  }
}
