// base-user.interface.ts
import { AccountStatus } from "../enums/account-status.enum"

export interface IBaseUser {
  id: string
  email: string
  bojId: string
  phone: string
  isEmailVerified: boolean
  isPhoneVerified: boolean
  emailVerifiedAt?: Date
  phoneVerifiedAt?: Date
  status: AccountStatus
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}
