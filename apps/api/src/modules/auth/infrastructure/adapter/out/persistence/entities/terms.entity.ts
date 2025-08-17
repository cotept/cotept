import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';

import { TermsAgreementEntity } from './terms-agreement.entity';

@Entity('TERMS')
export class TermsEntity {
  @PrimaryColumn({ name: 'terms_id', type: 'varchar2', length: 36 })
  id: string;

  @Column({ name: 'title', type: 'varchar2', length: 200 })
  title: string;

  @Column({ name: 'content', type: 'clob' })
  content: string;

  @Column({ name: 'type', type: 'varchar2', length: 50 })
  type: string;

  @Column({ name: 'version', type: 'varchar2', length: 20 })
  version: string;

  @Column({ name: 'required', type: 'number', default: 1 })
  required: number;

  @Column({ name: 'active', type: 'number', default: 1 })
  active: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @OneToMany(() => TermsAgreementEntity, agreement => agreement.terms)
  agreements: TermsAgreementEntity[];
}
