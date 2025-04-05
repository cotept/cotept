import { Injectable, OnModuleInit } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { DataSource } from "typeorm"
import { CacheService } from "./shared/infrastructure/cache/redis/cache.service"
@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private dataSource: DataSource,
    private configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {}

  async onModuleInit() {
    try {
      // 데이터베이스 연결 테스트
      const isConnected = this.dataSource.isInitialized
      console.log("Database connection status:", isConnected)
      console.log("DB Config:", this.configService.get("database"))

      if (isConnected) {
        // 간단한 쿼리 테스트
        const result = await this.dataSource.query("SELECT 1 FROM DUAL")
        console.log("Query result:", result)
      } else {
        console.error("Database is not connected")
      }
      // Redis 연결 테스트
      try {
        console.log("Redis Config:", this.configService.get("redis"))

        const key = "test-key"
        const value = "test-value"

        console.log(`Setting cache key "${key}" with value:`, value)
        await this.cacheService.set(key, value)

        const cachedValue = await this.cacheService.get(key)
        console.log(`Retrieved cache value for key "${key}":`, cachedValue)

        const deletedCachedValue = await this.cacheService.delete(key)
        console.log(`deleted cache value for key "${key}":`, deletedCachedValue)

        if (cachedValue === value) {
          console.log("✅ Redis cache is working correctly!")
        } else {
          console.error("❌ Redis cache test failed! Values do not match.")
        }
      } catch (error) {
        console.error("Redis connection error:", error)
      }
    } catch (error) {
      console.error("Database connection error:", error)
    }
  }

  getHello(): string {
    return "Hello World!"
  }
}
