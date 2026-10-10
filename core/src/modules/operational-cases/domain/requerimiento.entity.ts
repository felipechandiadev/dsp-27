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
import { Incidencia } from './incidencia.entity';
import { OperationArea } from '@modules/territory/domain/operation-area.entity';
import { Person } from '@modules/persons/domain/person.entity';

@Entity({ name: 'requerimientos' })
export class Requerimiento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'varchar', default: 'ingresado' })
  status: string;

  @Column({ type: 'varchar', default: 'P2' })
  prioridad: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt: Date;

  @Column({ type: 'double precision', nullable: true })
  lat: number | null;

  @Column({ type: 'double precision', nullable: true })
  lng: number | null;

  @Column({ name: 'location_description', type: 'text', nullable: true })
  locationDescription: string | null;

  @Column({ name: 'area_id', type: 'uuid', nullable: true })
  areaId: string | null;

  @ManyToOne(() => OperationArea, { nullable: true })
  @JoinColumn({ name: 'area_id' })
  area: OperationArea | null;

  @Column({ name: 'incidencia_id', type: 'uuid', nullable: true })
  incidenciaId: string | null;

  @ManyToOne(() => Incidencia, { nullable: true })
  @JoinColumn({ name: 'incidencia_id' })
  incidencia: Incidencia | null;

  @Column({ name: 'persona_solicitante_id', type: 'uuid', nullable: true })
  personaSolicitanteId: string | null;

  @ManyToOne(() => Person, { nullable: true })
  @JoinColumn({ name: 'persona_solicitante_id' })
  personaSolicitante: Person | null;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt: Date | null;

  @Column({ name: 'close_reason', type: 'text', nullable: true })
  closeReason: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
