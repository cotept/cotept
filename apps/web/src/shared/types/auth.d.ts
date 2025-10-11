import { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    refreshToken?: string
    user: {
      id: string
      role?: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role?: string
    accessToken?: string
    refreshToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    role?: string
    accessToken?: string
    refreshToken?: string
  }
}
