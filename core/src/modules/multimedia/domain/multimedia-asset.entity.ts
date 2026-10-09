import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'multimedia_assets' })
export class MultimediaAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'entity_type', type: 'varchar' })
  entityType: string;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @Column({ type: 'varchar' })
  kind: string;

  @Column({ name: 'mime_type', type: 'varchar' })
  mimeType: string;

  @Column({ name: 'original_name', type: 'varchar' })
  originalName: string;

  @Column({ name: 'storage_key', type: 'varchar' })
  storageKey: string;

  @Column({ name: 'storage_driver', type: 'varchar' })
  storageDriver: string;

  @Column({ name: 'byte_size', type: 'int' })
  byteSize: number;

  @Column({ type: 'varchar', nullable: true })
  checksum: string | null;

  @Column({ type: 'varchar', default: 'interno' })
  classification: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'uploaded_by_user_id', type: 'uuid', nullable: true })
  uploadedByUserId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
