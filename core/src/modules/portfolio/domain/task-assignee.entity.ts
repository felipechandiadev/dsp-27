import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'task_assignees' })
export class TaskAssignee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'task_id', type: 'uuid', nullable: true })
  taskId: string | null;

  @Column({ name: 'subtask_id', type: 'uuid', nullable: true })
  subtaskId: string | null;

  @Column({ name: 'person_id', type: 'uuid', nullable: true })
  personId: string | null;

  @Column({ name: 'staff_id', type: 'uuid', nullable: true })
  staffId: string | null;

  @Column({ name: 'assignment_role', type: 'varchar', default: 'executor' })
  assignmentRole: string;

  @Column({ name: 'assigned_at', type: 'timestamptz' })
  assignedAt: Date;

  @Column({ name: 'unassigned_at', type: 'timestamptz', nullable: true })
  unassignedAt: Date | null;

  @Column({ name: 'assigned_by_user_id', type: 'uuid', nullable: true })
  assignedByUserId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
