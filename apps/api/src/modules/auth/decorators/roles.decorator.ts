import { SetMetadata } from "@nestjs/common"
import { UserRole } from "@repo/shared/src/users/base"

export const Roles = (...roles: UserRole[]) => SetMetadata("roles", roles)
