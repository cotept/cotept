export interface RedisConfig {
  host: string
  port: number
  password: string
  db: number
  ttl: number
  namespace: string
}

export const redisConfig = () => ({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB, 10) : 0,
  ttl: process.env.REDIS_TTL ? parseInt(process.env.REDIS_TTL, 10) : 3600000, // 기본 1시간
  namespace: process.env.REDIS_NAMESPACE || "cotept",
})
