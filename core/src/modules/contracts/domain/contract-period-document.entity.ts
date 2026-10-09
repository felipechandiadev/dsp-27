import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ContractPeriod } from './contract-period.entity';

@Entity({ name: 'contract_period_documents' })
@Unique(['periodId', 'docType'])
export class ContractPeriodDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'period_id', type: 'uuid' })
  periodId: string;

  @ManyToOne(() => ContractPeriod, (p) => p.documents)
  @JoinColumn({ name: 'period_id' })
  period: ContractPeriod;

  @Column({ name: 'doc_type', type: 'varchar' })
  docType: string;

  @Column({ type: 'varchar', default: 'missing' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
