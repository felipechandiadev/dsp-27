import { Project } from '@modules/portfolio/domain/project.entity';
import { Task } from '@modules/portfolio/domain/task.entity';
import { WorkNote } from '@modules/portfolio/domain/work-note.entity';
import { TaskAssignee } from '@modules/portfolio/domain/task-assignee.entity';

export const PORTFOLIO_REPOSITORY = Symbol('PORTFOLIO_REPOSITORY');

export interface PortfolioRepositoryPort {
  listProjects(kind?: string): Promise<Project[]>;
  findProjectByCode(code: string): Promise<Project | null>;
  findTaskById(taskId: string): Promise<Task | null>;
  listTasks(): Promise<Task[]>;
  listTasksByProjectId(projectId: string): Promise<Task[]>;
  listNotes(entityType: string, entityId: string): Promise<WorkNote[]>;
  listActiveAssigneesByTaskId(taskId: string): Promise<TaskAssignee[]>;
  assignPersonToTask(input: {
    taskId: string;
    personId: string;
    assignmentRole: string;
    assignedByUserId: string;
  }): Promise<TaskAssignee>;
}
