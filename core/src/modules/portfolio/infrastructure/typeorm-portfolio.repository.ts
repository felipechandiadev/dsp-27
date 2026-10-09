import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Project } from '../domain/project.entity';
import { Task } from '../domain/task.entity';
import { WorkNote } from '../domain/work-note.entity';
import { TaskAssignee } from '../domain/task-assignee.entity';
import { PortfolioRepositoryPort } from '../application/ports/portfolio.repository.port';

@Injectable()
export class TypeOrmPortfolioRepository implements PortfolioRepositoryPort {
  constructor(
    @InjectRepository(Project)
    private readonly projects: Repository<Project>,
    @InjectRepository(Task)
    private readonly tasks: Repository<Task>,
    @InjectRepository(WorkNote)
    private readonly notes: Repository<WorkNote>,
    @InjectRepository(TaskAssignee)
    private readonly assignees: Repository<TaskAssignee>,
  ) {}

  listProjects(): Promise<Project[]> {
    return this.projects.find({
      relations: ['strategicObjectives'],
      order: { code: 'ASC' },
    });
  }

  findProjectByCode(code: string): Promise<Project | null> {
    return this.projects.findOne({
      where: { code },
      relations: ['strategicObjectives'],
    });
  }

  findTaskById(taskId: string): Promise<Task | null> {
    return this.tasks.findOne({ where: { id: taskId } });
  }

  listTasksByProjectId(projectId: string): Promise<Task[]> {
    return this.tasks.find({
      where: { projectId },
      order: { sortOrder: 'ASC', title: 'ASC' },
    });
  }

  listNotes(entityType: string, entityId: string): Promise<WorkNote[]> {
    return this.notes.find({
      where: { entityType, entityId },
      order: { createdAt: 'ASC' },
    });
  }

  listActiveAssigneesByTaskId(taskId: string): Promise<TaskAssignee[]> {
    return this.assignees.find({
      where: { taskId, unassignedAt: IsNull() },
      order: { assignedAt: 'DESC' },
    });
  }

  async assignPersonToTask(input: {
    taskId: string;
    personId: string;
    assignmentRole: string;
    assignedByUserId: string;
  }): Promise<TaskAssignee> {
    const existing = await this.assignees.findOne({
      where: {
        taskId: input.taskId,
        personId: input.personId,
        unassignedAt: IsNull(),
      },
    });
    if (existing) {
      existing.assignmentRole = input.assignmentRole;
      existing.assignedByUserId = input.assignedByUserId;
      return this.assignees.save(existing);
    }
    const row = this.assignees.create({
      taskId: input.taskId,
      subtaskId: null,
      personId: input.personId,
      staffId: null,
      assignmentRole: input.assignmentRole,
      assignedAt: new Date(),
      unassignedAt: null,
      assignedByUserId: input.assignedByUserId,
    });
    return this.assignees.save(row);
  }
}
