import { Column, Entity, OneToMany } from "typeorm"

import { TermsAgreementEntity } from "./terms-agreement.entity"

import { BaseEntity } from "@/shared/infrastructure/persistence/base/base.entity"

@Entity("TERMS")
export class TermsEntity extends BaseEntity<TermsEntity> {
  @Column({ name: "title", type: "varchar2", length: 200 })
  title: string

  @Column({ name: "content", type: "clob" })
  content: string

  @Column({ name: "type", type: "varchar2", length: 50 })
  type: string

  @Column({ name: "version", type: "varchar2", length: 20 })
  version: string

  @Column({ name: "required", type: "number", default: 1 })
  required: number

  @Column({ name: "active", type: "number", default: 1 })
  active: number

  @OneToMany(() => TermsAgreementEntity, (agreement) => agreement.terms)
  agreements: TermsAgreementEntity[]
}
