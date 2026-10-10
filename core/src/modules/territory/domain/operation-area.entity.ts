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
import { OperationAreaType } from './operation-area-type.entity';

@Entity({ name: 'operation_areas' })
export class OperationArea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ name: 'type_id', type: 'uuid' })
  typeId: string;

  @ManyToOne(() => OperationAreaType)
  @JoinColumn({ name: 'type_id' })
  type: OperationAreaType;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string | null;

  @ManyToOne(() => OperationArea, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: OperationArea | null;

  /** Geometry is stored in PostGIS; not mapped by TypeORM — use GeometryService. */

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
