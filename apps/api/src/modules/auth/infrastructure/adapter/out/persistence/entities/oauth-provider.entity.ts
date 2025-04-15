import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { UserOAuthAccountEntity } from './user-oauth-account.entity';

@Entity('OAUTH_PROVIDERS')
export class OAuthProviderEntity {
  @PrimaryColumn({ name: 'provider_id', type: 'varchar2', length: 36 })
  id: string;

  @Column({ name: 'name', type: 'varchar2', length: 50, unique: true })
  name: string;

  @Column({ name: 'client_id', type: 'varchar2', length: 255 })
  clientId: string;

  @Column({ name: 'client_secret', type: 'varchar2', length: 255 })
  clientSecret: string;

  @Column({ name: 'auth_url', type: 'varchar2', length: 500 })
  authUrl: string;

  @Column({ name: 'token_url', type: 'varchar2', length: 500 })
  tokenUrl: string;

  @Column({ name: 'userinfo_url', type: 'varchar2', length: 500 })
  userInfoUrl: string;

  @Column({ name: 'redirect_url', type: 'varchar2', length: 500 })
  redirectUrl: string;

  @Column({ name: 'scope', type: 'varchar2', length: 500, nullable: true })
  scope: string | null;

  @Column({ name: 'active', type: 'number', default: 1 })
  active: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @OneToMany(() => UserOAuthAccountEntity, account => account.provider)
  accounts: UserOAuthAccountEntity[];
}
