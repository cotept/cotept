export interface JwtConfig {
  jwtSecret: string
  jwtRefreshSecret: string
  accessExpiresIn: string
  refreshExpiresIn: string
}

export const jwtConfig = () => ({
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
})

export interface AuthCodeConfig {
  authCodeLength: number
  authCodeExpiresIn: number
}

export const authCodeConfig = () => ({
  authCodeLength: process.env.AUTH_CODE_LENGTH,
  authCodeExpiresIn: process.env.AUTH_CODE_EXPIRES_IN,
})

export interface clentUrlConfig {
  clientUrl: string
  clientErrorUrl: string
}

export const clentUrlConfig = () => ({
  clientUrl: process.env.CLIENT_URL,
  clientErrorUrl: process.env.CLIENT_ERROR_URL,
})
