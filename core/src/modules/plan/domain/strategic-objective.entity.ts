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
import { PlanInstrument } from './plan-instrument.entity';

@Entity({ name: 'strategic_objectives' })
@Unique(['planInstrumentId', 'code'])
export class StrategicObjective {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'plan_instrument_id', type: 'uuid' })
  planInstrumentId: string;

  @ManyToOne(() => PlanInstrument, (p) => p.objectives)
  @JoinColumn({ name: 'plan_instrument_id' })
  planInstrument: PlanInstrument;

  @Column({ type: 'varchar' })
  code: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  rationale: string | null;

  @Column({ type: 'text', nullable: true })
  verification: string | null;

  @Column({ name: 'out_of_scope', type: 'text', nullable: true })
  outOfScope: string | null;

  @Column({ name: 'diagnosis_links', type: 'text', nullable: true })
  diagnosisLinks: string | null;

  @Column({ type: 'varchar', default: 'on_track' })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
