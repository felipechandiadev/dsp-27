import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StrategicObjective } from '@modules/plan/domain/strategic-objective.entity';
import { Task } from './task.entity';

@Entity({ name: 'projects' })
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'varchar' })
  kind: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ name: 'lead_role', type: 'varchar', nullable: true })
  leadRole: string | null;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ type: 'text', nullable: true })
  problem: string | null;

  @Column({ type: 'text', nullable: true })
  scope: string | null;

  @Column({ name: 'legal_milestone', type: 'text', nullable: true })
  legalMilestone: string | null;

  @Column({
    name: 'progress_override',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  progressOverride: string | null;

  @Column({ name: 'starts_on', type: 'date', nullable: true })
  startsOn: string | null;

  @Column({ name: 'ends_on', type: 'date', nullable: true })
  endsOn: string | null;

  @ManyToMany(() => StrategicObjective)
  @JoinTable({
    name: 'project_strategic_objectives',
    joinColumn: { name: 'project_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'strategic_objective_id',
      referencedColumnName: 'id',
    },
  })
  strategicObjectives: StrategicObjective[];

  @OneToMany(() => Task, (t) => t.project)
  tasks: Task[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
