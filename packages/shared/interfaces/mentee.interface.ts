import { IBaseUser } from "./base-user.interface"

export interface IMentee extends IBaseUser {
  currentTier?: string
}
