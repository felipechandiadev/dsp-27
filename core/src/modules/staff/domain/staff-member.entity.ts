import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Person } from '@modules/persons/domain/person.entity';
import { StaffRequirementCheck } from './staff-requirement-check.entity';

@Entity({ name: 'staff' })
export class StaffMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ name: 'persona_id', type: 'uuid', unique: true })
  personaId: string;

  @OneToOne(() => Person)
  @JoinColumn({ name: 'persona_id' })
  person: Person;

  @Column({ type: 'varchar' })
  unit: string;

  @Column({ name: 'ds97_profile', type: 'varchar', nullable: true })
  ds97Profile: string | null;

  @Column({
    name: 'inspector_quality_status',
    type: 'varchar',
    default: 'none',
  })
  inspectorQualityStatus: string;

  @Column({ name: 'appointment_at', type: 'date', nullable: true })
  appointmentAt: string | null;

  @Column({ name: 'prior_to_law', type: 'boolean', default: false })
  priorToLaw: boolean;

  @Column({ name: 'employee_number', type: 'varchar', nullable: true })
  employeeNumber: string | null;

  @Column({ name: 'work_email', type: 'varchar', nullable: true })
  workEmail: string | null;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @OneToMany(() => StaffRequirementCheck, (c) => c.staff)
  requirements: StaffRequirementCheck[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
