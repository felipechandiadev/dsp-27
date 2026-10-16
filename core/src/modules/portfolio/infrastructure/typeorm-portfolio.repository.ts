import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { StrategicObjective } from '@modules/plan/domain/strategic-objective.entity';
import { Project } from '../domain/project.entity';
import { Task } from '../domain/task.entity';
import { Subtask } from '../domain/subtask.entity';
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
    @InjectRepository(Subtask)
    private readonly subtasks: Repository<Subtask>,
    @InjectRepository(WorkNote)
    private readonly notes: Repository<WorkNote>,
    @InjectRepository(TaskAssignee)
    private readonly assignees: Repository<TaskAssignee>,
    @InjectRepository(StrategicObjective)
    private readonly objectives: Repository<StrategicObjective>,
  ) {}

  listProjects(kind?: string): Promise<Project[]> {
    return this.projects.find({
      where: kind ? { kind } : {},
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

  findTaskWithObjectives(taskId: string): Promise<Task | null> {
    return this.tasks.findOne({
      where: { id: taskId },
      relations: ['strategicObjectives', 'project'],
    });
  }

  listTasks(): Promise<Task[]> {
    return this.tasks.find({
      relations: ['project'],
      order: { sortOrder: 'ASC', code: 'ASC', title: 'ASC' },
    });
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
    staffId?: string | null;
    assignmentRole: string;
    assignedByUserId: string;
  }): Promise<TaskAssignee> {
    const useStaffId = input.staffId ?? null;
    const usePersonId = useStaffId ? null : input.personId;

    const existing = await this.assignees.findOne({
      where: useStaffId
        ? { taskId: input.taskId, staffId: useStaffId, unassignedAt: IsNull() }
        : {
            taskId: input.taskId,
            personId: input.personId,
            unassignedAt: IsNull(),
          },
    });
    if (existing) {
      existing.assignmentRole = input.assignmentRole;
      existing.assignedByUserId = input.assignedByUserId;
      existing.staffId = useStaffId;
      existing.personId = usePersonId;
      return this.assignees.save(existing);
    }
    const row = this.assignees.create({
      taskId: input.taskId,
      subtaskId: null,
      personId: usePersonId,
      staffId: useStaffId,
      assignmentRole: input.assignmentRole,
      assignedAt: new Date(),
      unassignedAt: null,
      assignedByUserId: input.assignedByUserId,
    });
    return this.assignees.save(row);
  }

  findSubtaskById(subtaskId: string): Promise<Subtask | null> {
    return this.subtasks.findOne({
      where: { id: subtaskId },
      relations: ['task'],
    });
  }

  findSubtaskWithObjectives(subtaskId: string): Promise<Subtask | null> {
    return this.subtasks.findOne({
      where: { id: subtaskId },
      relations: ['strategicObjectives', 'task'],
    });
  }

  listSubtasksByTaskId(taskId: string): Promise<Subtask[]> {
    return this.subtasks.find({
      where: { taskId },
      relations: ['strategicObjectives'],
      order: { sortOrder: 'ASC', title: 'ASC' },
    });
  }

  saveSubtask(subtask: Subtask): Promise<Subtask> {
    return this.subtasks.save(subtask);
  }

  saveTask(task: Task): Promise<Task> {
    return this.tasks.save(task);
  }

  findStrategicObjectivesByIds(ids: string[]): Promise<StrategicObjective[]> {
    if (ids.length === 0) return Promise.resolve([]);
    return this.objectives.find({ where: { id: In(ids) } });
  }
}
