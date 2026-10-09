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
import { LegalNorm } from './legal-norm.entity';

@Entity({ name: 'legal_norm_analyses' })
export class LegalNormAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'legal_norm_id', type: 'uuid' })
  legalNormId: string;

  @ManyToOne(() => LegalNorm)
  @JoinColumn({ name: 'legal_norm_id' })
  legalNorm: LegalNorm;

  @Column({ name: 'plan_instrument_id', type: 'uuid', nullable: true })
  planInstrumentId: string | null;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'varchar', default: 'draft' })
  status: string;

  @Column({ name: 'author_user_id', type: 'uuid', nullable: true })
  authorUserId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
