export interface OAuthGithubConfig {
  clientID: string
  clientSecret: string
  callbackURL: string
}

export const OAuthGithubConfig = () => ({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CLIENT_CALLBACK_URL,
})
