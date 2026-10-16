import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StrategicObjective } from '@modules/plan/domain/strategic-objective.entity';
import { Task } from './task.entity';

@Entity({ name: 'subtasks' })
export class Subtask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'task_id', type: 'uuid' })
  taskId: string;

  @ManyToOne(() => Task, (t) => t.subtasks)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'objective_text', type: 'text', nullable: true })
  objectiveText: string | null;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  /** PostGIS Point stored in DB; not mapped — set via raw SQL if needed. */

  @Column({
    name: 'location_accuracy_m',
    type: 'numeric',
    nullable: true,
  })
  locationAccuracyM: string | null;

  @Column({ name: 'located_at', type: 'timestamptz', nullable: true })
  locatedAt: Date | null;

  @Column({ name: 'starts_on', type: 'date', nullable: true })
  startsOn: string | null;

  @Column({ name: 'ends_on', type: 'date', nullable: true })
  endsOn: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @ManyToMany(() => StrategicObjective)
  @JoinTable({
    name: 'subtask_strategic_objectives',
    joinColumn: { name: 'subtask_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'strategic_objective_id',
      referencedColumnName: 'id',
    },
  })
  strategicObjectives: StrategicObjective[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
