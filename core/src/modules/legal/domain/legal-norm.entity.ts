import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'legal_norms' })
export class LegalNorm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'varchar' })
  kind: string;

  @Column({ name: 'number_label', type: 'varchar' })
  numberLabel: string;

  @Column({ name: 'short_title', type: 'varchar' })
  shortTitle: string;

  @Column({ type: 'varchar', default: 'in_force' })
  status: string;

  @Column({ name: 'published_on', type: 'date', nullable: true })
  publishedOn: string | null;

  @Column({ name: 'effective_on', type: 'date', nullable: true })
  effectiveOn: string | null;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
