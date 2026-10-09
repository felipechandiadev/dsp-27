import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StaffMember } from './staff-member.entity';

@Entity({ name: 'staff_requirement_checks' })
export class StaffRequirementCheck {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'staff_id', type: 'uuid' })
  staffId: string;

  @ManyToOne(() => StaffMember, (s) => s.requirements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff: StaffMember;

  @Column({ name: 'requirement_code', type: 'varchar' })
  requirementCode: string;

  @Column({ type: 'varchar', default: 'missing' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
