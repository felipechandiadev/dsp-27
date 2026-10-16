import { StrategicObjective } from '@modules/plan/domain/strategic-objective.entity';
import { Project } from '@modules/portfolio/domain/project.entity';
import { Task } from '@modules/portfolio/domain/task.entity';
import { Subtask } from '@modules/portfolio/domain/subtask.entity';
import { WorkNote } from '@modules/portfolio/domain/work-note.entity';
import { TaskAssignee } from '@modules/portfolio/domain/task-assignee.entity';

export const PORTFOLIO_REPOSITORY = Symbol('PORTFOLIO_REPOSITORY');

export interface PortfolioRepositoryPort {
  listProjects(kind?: string): Promise<Project[]>;
  findProjectByCode(code: string): Promise<Project | null>;
  findTaskById(taskId: string): Promise<Task | null>;
  findTaskWithObjectives(taskId: string): Promise<Task | null>;
  listTasks(): Promise<Task[]>;
  listTasksByProjectId(projectId: string): Promise<Task[]>;
  listNotes(entityType: string, entityId: string): Promise<WorkNote[]>;
  listActiveAssigneesByTaskId(taskId: string): Promise<TaskAssignee[]>;
  assignPersonToTask(input: {
    taskId: string;
    personId: string;
    staffId?: string | null;
    assignmentRole: string;
    assignedByUserId: string;
  }): Promise<TaskAssignee>;
  findSubtaskById(subtaskId: string): Promise<Subtask | null>;
  findSubtaskWithObjectives(subtaskId: string): Promise<Subtask | null>;
  listSubtasksByTaskId(taskId: string): Promise<Subtask[]>;
  saveSubtask(subtask: Subtask): Promise<Subtask>;
  saveTask(task: Task): Promise<Task>;
  findStrategicObjectivesByIds(ids: string[]): Promise<StrategicObjective[]>;
}
