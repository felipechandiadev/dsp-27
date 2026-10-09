import { Project } from '@modules/portfolio/domain/project.entity';
import { Task } from '@modules/portfolio/domain/task.entity';
import { WorkNote } from '@modules/portfolio/domain/work-note.entity';

export const PORTFOLIO_REPOSITORY = Symbol('PORTFOLIO_REPOSITORY');

export interface PortfolioRepositoryPort {
  listProjects(): Promise<Project[]>;
  findProjectByCode(code: string): Promise<Project | null>;
  listTasksByProjectId(projectId: string): Promise<Task[]>;
  listNotes(entityType: string, entityId: string): Promise<WorkNote[]>;
}
