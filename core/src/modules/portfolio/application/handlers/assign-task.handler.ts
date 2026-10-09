import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from '@modules/persons/domain/person.entity';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '@modules/users/application/ports/user.repository.port';
import {
  NOTIFICATION_PUBLISHER,
  NotificationPublisherPort,
} from '@modules/notifications/application/ports/notification.publisher.port';
import { AssignTaskCommand } from '../commands/assign-task.command';
import {
  PORTFOLIO_REPOSITORY,
  PortfolioRepositoryPort,
} from '../ports/portfolio.repository.port';

@Injectable()
@CommandHandler(AssignTaskCommand)
export class AssignTaskHandler implements ICommandHandler<AssignTaskCommand> {
  constructor(
    @Inject(PORTFOLIO_REPOSITORY)
    private readonly portfolio: PortfolioRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
    @InjectRepository(Person)
    private readonly persons: Repository<Person>,
    @Inject(NOTIFICATION_PUBLISHER)
    private readonly notifications: NotificationPublisherPort,
  ) {}

  async execute(command: AssignTaskCommand) {
    const task = await this.portfolio.findTaskById(command.taskId);
    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    const person = await this.persons.findOne({
      where: { id: command.personId },
    });
    if (!person) {
      throw new NotFoundException('Persona no encontrada');
    }

    const assignee = await this.portfolio.assignPersonToTask({
      taskId: command.taskId,
      personId: command.personId,
      assignmentRole: command.assignmentRole,
      assignedByUserId: command.actorUserId,
    });

    const audienceUser = await this.users.findByPersonaId(command.personId);
    const actor = await this.users.findByIdWithPerson(command.actorUserId);
    const actorName = actor?.person
      ? `${actor.person.firstName} ${actor.person.lastName}`.trim()
      : actor?.username || 'Un colega';

    const title = `Tarea asignada: ${task.title}`;
    const body = `${actorName} te asignó la tarea «${task.title}» (${command.assignmentRole}).`;

    await this.notifications.publish({
      source: 'user',
      domain: 'portfolio',
      kind: 'portfolio.task_assigned',
      severity: 'info',
      title,
      body,
      payload: {
        taskId: task.id,
        projectId: task.projectId,
        personId: person.id,
        assignmentRole: command.assignmentRole,
        assigneeId: assignee.id,
      },
      groupKey: `task_assigned:${task.id}:${person.id}`,
      actorUserId: command.actorUserId,
      projectId: task.projectId,
      taskId: task.id,
      audienceUserId: audienceUser?.id ?? null,
      email: {
        toEmail: person.email,
        subject: title,
        bodyHtml: `<p>${body}</p><p>Abre DSP-27 para ver el detalle.</p>`,
      },
    });

    return {
      id: assignee.id,
      taskId: assignee.taskId,
      personId: assignee.personId,
      assignmentRole: assignee.assignmentRole,
      assignedAt: assignee.assignedAt,
      audienceUserId: audienceUser?.id ?? null,
    };
  }
}
