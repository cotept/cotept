import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  /**
   * 키 값 조회
   * @param key 키
   */
  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  /**
   * 키에 값 설정
   * @param key 키
   * @param value 값
   * @param expireTime 만료 시간(초), 없으면 영구 저장
   */
  async set(key: string, value: string, expireTime?: number): Promise<void> {
    if (expireTime) {
      await this.redisClient.set(key, value, 'EX', expireTime);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  /**
   * 키 삭제
   * @param key 키
   */
  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  /**
   * 키 존재 여부 확인
   * @param key 키
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.redisClient.exists(key);
    return result === 1;
  }

  /**
   * 패턴에 매칭되는 키 조회
   * @param pattern 패턴
   */
  async keys(pattern: string): Promise<string[]> {
    return await this.redisClient.keys(pattern);
  }

  /**
   * 여러 키 한번에 삭제
   * @param keys 키 배열
   */
  async deleteMany(keys: string[]): Promise<void> {
    if (keys.length > 0) {
      await this.redisClient.del(...keys);
    }
  }

  /**
   * 객체 저장 (JSON으로 직렬화)
   * @param key 키
   * @param value 객체
   * @param expireTime 만료 시간(초)
   */
  async setObject<T>(key: string, value: T, expireTime?: number): Promise<void> {
    const stringValue = JSON.stringify(value);
    await this.set(key, stringValue, expireTime);
  }

  /**
   * 객체 조회 (JSON에서 역직렬화)
   * @param key 키
   */
  async getObject<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Error parsing Redis value for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Redis 클라이언트 직접 반환
   * 복잡한 Redis 작업을 위해 필요한 경우 사용
   */
  getClient(): Redis {
    return this.redisClient;
  }
}
