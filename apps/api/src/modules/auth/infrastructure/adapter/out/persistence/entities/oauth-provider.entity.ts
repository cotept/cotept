import { Column, Entity, OneToMany } from "typeorm"

import { UserOAuthAccountEntity } from "./user-oauth-account.entity"

import { BaseEntity } from "@/shared/infrastructure/persistence/base/base.entity"

@Entity("OAUTH_PROVIDERS")
export class OAuthProviderEntity extends BaseEntity<OAuthProviderEntity> {
  @Column({ name: "name", type: "varchar2", length: 50, unique: true })
  name: string

  @Column({ name: "client_id", type: "varchar2", length: 255 })
  clientId: string

  @Column({ name: "client_secret", type: "varchar2", length: 255 })
  clientSecret: string

  @Column({ name: "auth_url", type: "varchar2", length: 500 })
  authUrl: string

  @Column({ name: "token_url", type: "varchar2", length: 500 })
  tokenUrl: string

  @Column({ name: "userinfo_url", type: "varchar2", length: 500 })
  userInfoUrl: string

  @Column({ name: "redirect_url", type: "varchar2", length: 500 })
  redirectUrl: string

  @Column({ name: "scope", type: "varchar2", length: 500, nullable: true })
  scope: string | null

  @Column({ name: "active", type: "number", default: 1 })
  active: number

  @OneToMany(() => UserOAuthAccountEntity, (account) => account.provider)
  accounts: UserOAuthAccountEntity[]
}
