import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateTaskObjectivesCommand } from '../commands/update-task-objectives.command';
import {
  PORTFOLIO_REPOSITORY,
  PortfolioRepositoryPort,
} from '../ports/portfolio.repository.port';
import {
  mapObjectiveCodes,
  resolveStrategicObjectives,
} from '../helpers/strategic-objectives.helper';

@CommandHandler(UpdateTaskObjectivesCommand)
export class UpdateTaskObjectivesHandler
  implements ICommandHandler<UpdateTaskObjectivesCommand>
{
  constructor(
    @Inject(PORTFOLIO_REPOSITORY)
    private readonly portfolio: PortfolioRepositoryPort,
  ) {}

  async execute(cmd: UpdateTaskObjectivesCommand) {
    const task = await this.portfolio.findTaskWithObjectives(cmd.taskId);
    if (!task) throw new NotFoundException('Tarea no encontrada');

    task.strategicObjectives =
      (await resolveStrategicObjectives(
        this.portfolio,
        cmd.strategicObjectiveIds,
      )) ?? [];

    await this.portfolio.saveTask(task);
    return {
      id: task.id,
      code: task.code,
      title: task.title,
      strategicObjectives: mapObjectiveCodes(task.strategicObjectives),
    };
  }
}
