import { SessionUpdateContext, UpdateStrategy } from "@/shared/auth/strategies/update-strategy.interface"

export class TokenRefreshStrategy implements UpdateStrategy {
  isApplicable(context: SessionUpdateContext): boolean {
    return context.trigger === "update" && context.session?.trigger === "TOKEN_REFRESH"
  }

  async execute(context: SessionUpdateContext): Promise<any> {
    const { token, session } = context

    if (session.accessToken) {
      token.accessToken = session.accessToken
    }
    if (session.refreshToken) {
      token.refreshToken = session.refreshToken
    }

    return token
  }
}
