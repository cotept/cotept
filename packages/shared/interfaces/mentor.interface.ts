import { MentorApprovalStatus } from "../enums"
import { IBaseUser } from "./base-user.interface"
import { IMentorProfile } from "./mentor-profile.interface"

export interface IMentor extends IBaseUser {
  currentTier: string
  status: MentorApprovalStatus
  profile: IMentorProfile
  approvedAt?: Date
  approvedBy?: string
}
