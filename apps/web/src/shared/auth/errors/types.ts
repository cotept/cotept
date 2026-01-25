// Auth.js 표준 에러들

export interface AuthErrorInfo {
  message: string
  description?: string
  action?: string
}

export const AUTH_ERROR_TYPES = {
  CREDENTIALS_SIGNIN: "CredentialsSignin",
  OAUTH_SIGNIN: "OAuthSignInError",
  OAUTH_CALLBACK: "OAuthCallbackError",
  ACCESS_DENIED: "AccessDenied",
  MISSING_ADAPTER: "MissingAdapter",
  MISSING_SECRET: "MissingSecret",
  INVALID_PROVIDER: "InvalidProvider",
  ACCOUNT_NOT_LINKED: "AccountNotLinked",
  MISSING_CSRF: "MissingCSRF",
  EMAIL_SIGNIN: "EmailSignInError",
  OAUTH_PROFILE_PARSE: "OAuthProfileParseError",
  SIGNIN_ERROR: "SignInError",
} as const

export type AuthErrorType = (typeof AUTH_ERROR_TYPES)[keyof typeof AUTH_ERROR_TYPES]
