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
import { IncidentType } from './incident-type.entity';
import { OperationArea } from '@modules/territory/domain/operation-area.entity';

@Entity({ name: 'incidencias' })
export class Incidencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'varchar', default: 'sin_verificar' })
  status: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ name: 'incident_type_id', type: 'uuid', nullable: true })
  incidentTypeId: string | null;

  @ManyToOne(() => IncidentType, { nullable: true })
  @JoinColumn({ name: 'incident_type_id' })
  incidentType: IncidentType | null;

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

  @Column({ name: 'requerimiento_id', type: 'uuid', nullable: true })
  requerimientoId: string | null;

  @Column({ name: 'ingress_channel', type: 'varchar', default: 'central' })
  ingressChannel: string;

  @Column({
    name: 'registration_origin',
    type: 'varchar',
    default: 'dispatch_entry',
  })
  registrationOrigin: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
