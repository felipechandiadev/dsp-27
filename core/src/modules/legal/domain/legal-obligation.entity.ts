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
import { LegalNorm } from './legal-norm.entity';
import { StrategicObjective } from '@modules/plan/domain/strategic-objective.entity';
import { Project } from '@modules/portfolio/domain/project.entity';

@Entity({ name: 'legal_obligations' })
export class LegalObligation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'legal_norm_id', type: 'uuid' })
  legalNormId: string;

  @ManyToOne(() => LegalNorm)
  @JoinColumn({ name: 'legal_norm_id' })
  legalNorm: LegalNorm;

  @Column({ type: 'varchar', nullable: true, unique: true })
  code: string | null;

  @Column({ name: 'article_ref', type: 'varchar', nullable: true })
  articleRef: string | null;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'deadline_on', type: 'date', nullable: true })
  deadlineOn: string | null;

  @Column({ type: 'varchar', default: 'open' })
  status: string;

  @ManyToMany(() => StrategicObjective)
  @JoinTable({
    name: 'obligation_strategic_objectives',
    joinColumn: { name: 'legal_obligation_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'strategic_objective_id',
      referencedColumnName: 'id',
    },
  })
  strategicObjectives: StrategicObjective[];

  @ManyToMany(() => Project)
  @JoinTable({
    name: 'obligation_projects',
    joinColumn: { name: 'legal_obligation_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'project_id', referencedColumnName: 'id' },
  })
  projects: Project[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
