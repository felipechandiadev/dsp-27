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
import { DocumentType } from './document-type.entity';

@Entity({ name: 'managed_documents' })
export class ManagedDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ name: 'document_type_id', type: 'uuid', nullable: true })
  documentTypeId: string | null;

  @ManyToOne(() => DocumentType, { nullable: true })
  @JoinColumn({ name: 'document_type_id' })
  documentType?: DocumentType | null;

  @Column({ type: 'varchar', default: 'draft' })
  status: string;

  @Column({ name: 'body_json', type: 'jsonb', default: () => "'{}'" })
  bodyJson: Record<string, unknown>;

  @Column({ name: 'body_html', type: 'text', nullable: true })
  bodyHtml: string | null;

  /** Asset multimedia del cuerpo DOCX (BetterOffice). */
  @Column({ name: 'body_asset_id', type: 'uuid', nullable: true })
  bodyAssetId: string | null;

  @Column({ name: 'created_by_user_id', type: 'uuid', nullable: true })
  createdByUserId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
