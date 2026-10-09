import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'user_oauth_accounts' })
export class UserOauthAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar' })
  provider: string;

  @Column({ name: 'account_email', type: 'varchar', nullable: true })
  accountEmail: string | null;

  @Column({ name: 'access_token_enc', type: 'text' })
  accessTokenEnc: string;

  @Column({ name: 'refresh_token_enc', type: 'text' })
  refreshTokenEnc: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'text', default: '' })
  scopes: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
