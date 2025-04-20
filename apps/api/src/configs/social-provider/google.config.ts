export interface OAuthGoogleConfig {
  clientID: string
  clientSecret: string
  callbackURL: string
}

export const OAuthGoogleConfig = () => ({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CLIENT_CALLBACK_URL,
})
