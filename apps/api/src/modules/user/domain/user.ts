// apps/api/src/modules/user/domain/user.ts
export enum UserRole {
  MENTEE = "MENTEE",
  MENTOR = "MENTOR",
  ADMIN = "ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public phoneNumber: string,
    public passwordHash: string,
    public role: UserRole = UserRole.MENTEE,
    public status: UserStatus = UserStatus.ACTIVE,
    public loginFailCount: number = 0,
    public lastLoginAt?: Date,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public readonly deletedAt?: Date,
  ) {}
}
