import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateSubtaskObjectivesCommand } from '../commands/update-subtask-objectives.command';
import {
  PORTFOLIO_REPOSITORY,
  PortfolioRepositoryPort,
} from '../ports/portfolio.repository.port';
import { resolveStrategicObjectives } from '../helpers/strategic-objectives.helper';
import { mapSubtask } from '../helpers/subtask.mapper';

@CommandHandler(UpdateSubtaskObjectivesCommand)
export class UpdateSubtaskObjectivesHandler
  implements ICommandHandler<UpdateSubtaskObjectivesCommand>
{
  constructor(
    @Inject(PORTFOLIO_REPOSITORY)
    private readonly portfolio: PortfolioRepositoryPort,
  ) {}

  async execute(cmd: UpdateSubtaskObjectivesCommand) {
    const subtask = await this.portfolio.findSubtaskWithObjectives(
      cmd.subtaskId,
    );
    if (!subtask) throw new NotFoundException('Subtarea no encontrada');

    subtask.strategicObjectives =
      (await resolveStrategicObjectives(
        this.portfolio,
        cmd.strategicObjectiveIds,
      )) ?? [];

    await this.portfolio.saveSubtask(subtask);
    const full = await this.portfolio.findSubtaskWithObjectives(subtask.id);
    return mapSubtask(full!);
  }
}
