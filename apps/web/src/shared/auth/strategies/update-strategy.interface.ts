import { JWT } from "next-auth/jwt"

export interface SessionUpdateContext {
  token: JWT
  trigger?: "signIn" | "signUp" | "update"
  session: any
}

export interface UpdateStrategy {
  isApplicable(context: SessionUpdateContext): boolean
  execute(context: SessionUpdateContext): Promise<JWT>
}
