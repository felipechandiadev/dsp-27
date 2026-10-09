import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../domain/project.entity';
import { Task } from '../domain/task.entity';
import { WorkNote } from '../domain/work-note.entity';
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
}
