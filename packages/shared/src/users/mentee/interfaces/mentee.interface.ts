// mentee.interface.ts
import { IBaseUser } from "../../base"

export interface IMentee extends IBaseUser {
  currentTier?: string
}
