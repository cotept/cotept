//mentor.interface.ts
import { IBaseUser } from "../../base"
import { MentorApprovalStatus } from "../enums/mentor-approval-status.enum"
import { IMentorProfile } from "./mentor-profile.interface"

export interface IMentor extends IBaseUser {
  currentTier: string
  approvalStatus: MentorApprovalStatus
  profile: IMentorProfile
  approvedAt?: Date
  approvedBy?: string
}
