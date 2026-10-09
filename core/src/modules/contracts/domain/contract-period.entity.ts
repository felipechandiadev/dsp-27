import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Contract } from './contract.entity';
import { ContractPeriodDocument } from './contract-period-document.entity';

@Entity({ name: 'contract_periods' })
@Unique(['contractId', 'year', 'month'])
export class ContractPeriod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'contract_id', type: 'uuid' })
  contractId: string;

  @ManyToOne(() => Contract, (c) => c.periods)
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'varchar', default: 'open' })
  status: string;

  @Column({ name: 'docs_due_on', type: 'date' })
  docsDueOn: string;

  @Column({ name: 'certified_at', type: 'timestamptz', nullable: true })
  certifiedAt: Date | null;

  @Column({ name: 'certification_notes', type: 'text', nullable: true })
  certificationNotes: string | null;

  @OneToMany(() => ContractPeriodDocument, (d) => d.period)
  documents: ContractPeriodDocument[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
