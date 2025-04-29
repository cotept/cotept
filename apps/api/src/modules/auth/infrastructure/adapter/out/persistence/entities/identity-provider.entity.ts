import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { PhoneVerificationEntity } from './phone-verification.entity';

@Entity('IDENTITY_PROVIDERS')
export class IdentityProviderEntity {
  @PrimaryColumn({ name: 'provider_id', type: 'varchar2', length: 36 })
  id: string;

  @Column({ name: 'name', type: 'varchar2', length: 50, unique: true })
  name: string;

  @Column({ name: 'provider_type', type: 'varchar2', length: 50 })
  providerType: string;

  @Column({ name: 'api_key', type: 'varchar2', length: 255 })
  apiKey: string;

  @Column({ name: 'api_secret', type: 'varchar2', length: 255 })
  apiSecret: string;

  @Column({ name: 'config', type: 'clob', nullable: true })
  config: string | null;

  @Column({ name: 'active', type: 'number', default: 1 })
  active: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @OneToMany(() => PhoneVerificationEntity, verification => verification.provider)
  verifications: PhoneVerificationEntity[];
}
