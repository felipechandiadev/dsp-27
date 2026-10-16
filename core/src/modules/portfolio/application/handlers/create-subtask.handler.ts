import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subtask } from '../../domain/subtask.entity';
import { CreateSubtaskCommand } from '../commands/create-subtask.command';
import {
  PORTFOLIO_REPOSITORY,
  PortfolioRepositoryPort,
} from '../ports/portfolio.repository.port';
import {
  assertDateRange,
  resolveStrategicObjectives,
} from '../helpers/strategic-objectives.helper';
import { mapSubtask } from '../helpers/subtask.mapper';

@CommandHandler(CreateSubtaskCommand)
export class CreateSubtaskHandler
  implements ICommandHandler<CreateSubtaskCommand>
{
  constructor(
    @Inject(PORTFOLIO_REPOSITORY)
    private readonly portfolio: PortfolioRepositoryPort,
    @InjectRepository(Subtask)
    private readonly subtasks: Repository<Subtask>,
  ) {}

  async execute(cmd: CreateSubtaskCommand) {
    const task = await this.portfolio.findTaskById(cmd.taskId);
    if (!task) throw new NotFoundException('Tarea no encontrada');

    const title = cmd.input.title?.trim();
    if (!title) throw new BadRequestException('title es requerido');

    assertDateRange(cmd.input.startsOn, cmd.input.endsOn);
    const objectives = await resolveStrategicObjectives(
      this.portfolio,
      cmd.input.strategicObjectiveIds,
    );

    const row = this.subtasks.create({
      taskId: cmd.taskId,
      title,
      description: cmd.input.description?.trim() || null,
      objectiveText: cmd.input.objectiveText?.trim() || null,
      status: cmd.input.status?.trim() || 'pending',
      startsOn: cmd.input.startsOn ?? null,
      endsOn: cmd.input.endsOn ?? null,
      sortOrder: cmd.input.sortOrder ?? 0,
      strategicObjectives: objectives ?? [],
    });
    const saved = await this.portfolio.saveSubtask(row);
    const full = await this.portfolio.findSubtaskWithObjectives(saved.id);
    return mapSubtask(full!);
  }
}
