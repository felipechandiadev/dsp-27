import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Contractor } from './contractor.entity';
import { ContractPeriod } from './contract-period.entity';

@Entity({ name: 'contracts' })
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'varchar' })
  kind: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar', default: 'draft' })
  status: string;

  @Column({ name: 'contractor_id', type: 'uuid' })
  contractorId: string;

  @ManyToOne(() => Contractor)
  @JoinColumn({ name: 'contractor_id' })
  contractor: Contractor;

  @Column({ name: 'its_user_id', type: 'uuid' })
  itsUserId: string;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId: string | null;

  @Column({ name: 'starts_on', type: 'date' })
  startsOn: string;

  @Column({ name: 'ends_on', type: 'date', nullable: true })
  endsOn: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => ContractPeriod, (p) => p.contract)
  periods: ContractPeriod[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
