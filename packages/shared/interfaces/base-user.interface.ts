export interface IBaseUser {
  id: string
  email: string
  password: string
  bojId: string
  phone: string
  isEmailVerified: boolean
  isPhoneVerified: boolean
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}
