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
import { OperationType } from './operation-type.entity';
import { Incidencia } from './incidencia.entity';
import { Requerimiento } from './requerimiento.entity';
import { OperationArea } from '@modules/territory/domain/operation-area.entity';
import { StaffMember } from '@modules/staff/domain/staff-member.entity';

@Entity({ name: 'field_operations' })
export class FieldOperation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'varchar', default: 'asignada' })
  status: string;

  @Column({ name: 'trigger_type', type: 'varchar' })
  triggerType: string;

  @Column({ type: 'varchar', default: 'P2' })
  prioridad: string;

  @Column({ type: 'text', nullable: true })
  briefing: string | null;

  @Column({ name: 'operation_type_id', type: 'uuid', nullable: true })
  operationTypeId: string | null;

  @ManyToOne(() => OperationType, { nullable: true })
  @JoinColumn({ name: 'operation_type_id' })
  operationType: OperationType | null;

  @Column({ name: 'requerimiento_id', type: 'uuid', nullable: true })
  requerimientoId: string | null;

  @ManyToOne(() => Requerimiento, { nullable: true })
  @JoinColumn({ name: 'requerimiento_id' })
  requerimiento: Requerimiento | null;

  @Column({ name: 'incidencia_id', type: 'uuid', nullable: true })
  incidenciaId: string | null;

  @ManyToOne(() => Incidencia, { nullable: true })
  @JoinColumn({ name: 'incidencia_id' })
  incidencia: Incidencia | null;

  @Column({ name: 'assigned_staff_id', type: 'uuid', nullable: true })
  assignedStaffId: string | null;

  @ManyToOne(() => StaffMember, { nullable: true })
  @JoinColumn({ name: 'assigned_staff_id' })
  assignedStaff: StaffMember | null;

  @Column({ name: 'area_id', type: 'uuid', nullable: true })
  areaId: string | null;

  @ManyToOne(() => OperationArea, { nullable: true })
  @JoinColumn({ name: 'area_id' })
  area: OperationArea | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
