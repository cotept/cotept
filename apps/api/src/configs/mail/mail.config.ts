export interface MailConfig {
  host: string
  port: number
  mailFrom: string
  user: string
  password: string
  maxConnections: number
  maxMessage: number
  rateDelta: number
}

export const mailConfig = () => ({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  mailFrom: process.env.SMTP_MAIL_FROM,
  user: process.env.SMTP_USER,
  password: process.env.SMTP_PASSWORD,
  maxConnections: process.env.SMTP_MAX_CONNECTIONS ? parseInt(process.env.SMTP_MAX_CONNECTIONS) : 5,
  maxMessage: process.env.SMTP_MAX_MASSAGE ? parseInt(process.env.SMTP_MAX_MASSAGE) : 100,
  rateDelta: process.env.SMTP_RATE_DELTA ? parseInt(process.env.SMTP_RATE_DELTA) : 1000,
})
