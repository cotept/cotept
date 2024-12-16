import { SocialProvider } from "../enums"

export interface IOAuthRedisData {
  state: {
    key: `oauth:state:${string}`
    value: {
      provider: SocialProvider
      redirectUri: string
      exp: number
    }
  }
  token: {
    key: `oauth:token:${string}`
    value: {
      accessToken: string
      refreshToken?: string
      exp: number
      userId?: string
    }
  }
}
