import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from './project.entity';

@Entity({ name: 'tasks' })
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @ManyToOne(() => Project, (p) => p.tasks)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ type: 'varchar', nullable: true })
  code: string | null;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'objective_text', type: 'text', nullable: true })
  objectiveText: string | null;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ name: 'lead_role', type: 'varchar', nullable: true })
  leadRole: string | null;

  @Column({ name: 'starts_on', type: 'date', nullable: true })
  startsOn: string | null;

  @Column({ name: 'ends_on', type: 'date', nullable: true })
  endsOn: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
