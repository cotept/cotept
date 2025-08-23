import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"

import { OAuthProviderEntity } from "./oauth-provider.entity"

import { UserEntity as User } from "@/modules/user/infrastructure/adapter/out/persistence/entities/user.entity"
import { BaseEntity } from "@/shared/infrastructure/persistence/base/base.entity"

@Entity("USER_OAUTH_ACCOUNTS")
export class UserOAuthAccountEntity extends BaseEntity<UserOAuthAccountEntity> {
  @Column({ name: "user_id", type: "varchar2", length: 36 })
  userId: string

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id", referencedColumnName: "idx" })
  user: User

  @Column({ name: "provider_id", type: "varchar2", length: 36 })
  providerId: string

  @ManyToOne(() => OAuthProviderEntity)
  @JoinColumn({ name: "provider_id", referencedColumnName: "idx" })
  provider: OAuthProviderEntity

  @Column({ name: "provider_user_id", type: "varchar2", length: 255 })
  providerUserId: string

  @Column({ name: "access_token", type: "clob", nullable: true })
  accessToken: string | null

  @Column({ name: "refresh_token", type: "clob", nullable: true })
  refreshToken: string | null

  @Column({ name: "token_expires_at", type: "timestamp", nullable: true })
  tokenExpiresAt: Date | null

  @Column({ name: "profile_data", type: "clob", nullable: true })
  profileData: string | null
}
