import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Person } from '@modules/persons/domain/person.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'persona_id', type: 'uuid', unique: true })
  personaId: string;

  @OneToOne(() => Person)
  @JoinColumn({ name: 'persona_id' })
  person: Person;

  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ name: 'password_hash', type: 'varchar' })
  passwordHash: string;

  /** Perfil de app — ver `USER_ROLES` en `user-roles.ts`. */
  @Column({ type: 'varchar' })
  role: string;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
