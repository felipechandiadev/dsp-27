import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StrategicObjective } from './strategic-objective.entity';

@Entity({ name: 'plan_instruments' })
export class PlanInstrument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', unique: true })
  year: number;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  version: string;

  @Column({ type: 'varchar', default: 'draft' })
  status: string;

  @Column({ name: 'mission_text', type: 'text' })
  missionText: string;

  @Column({ name: 'vision_text', type: 'text', nullable: true })
  visionText: string | null;

  @Column({ name: 'prioritization_notes', type: 'text', nullable: true })
  prioritizationNotes: string | null;

  @Column({ name: 'results_expected_text', type: 'text', nullable: true })
  resultsExpectedText: string | null;

  @Column({ name: 'starts_on', type: 'date', nullable: true })
  startsOn: string | null;

  @Column({ name: 'ends_on', type: 'date', nullable: true })
  endsOn: string | null;

  @OneToMany(() => StrategicObjective, (o) => o.planInstrument)
  objectives: StrategicObjective[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
