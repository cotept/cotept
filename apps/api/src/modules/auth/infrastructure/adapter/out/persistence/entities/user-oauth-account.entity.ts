import { UserEntity as User } from "@/modules/user/infrastructure/adapter/out/persistence/entities/user.entity"
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm"
import { OAuthProviderEntity } from "./oauth-provider.entity"

@Entity("USER_OAUTH_ACCOUNTS")
export class UserOAuthAccountEntity {
  @PrimaryColumn({ name: "oauth_id", type: "varchar2", length: 36 })
  id: string

  @Column({ name: "user_id", type: "varchar2", length: 36 })
  userId: string

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User

  @Column({ name: "provider_id", type: "varchar2", length: 36 })
  providerId: string

  @ManyToOne(() => OAuthProviderEntity)
  @JoinColumn({ name: "provider_id" })
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

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at", type: "timestamp", nullable: true })
  updatedAt: Date | null
}
