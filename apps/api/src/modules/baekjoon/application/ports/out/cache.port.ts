/**
 * 캐시 포트
 * 데이터 캐싱을 담당하는 아웃바운드 포트
 */
export abstract class CachePort {
  /**
   * 캐시에서 데이터를 조회합니다
   */
  abstract get<T>(key: string): Promise<T | null>

  /**
   * 캐시에 데이터를 저장합니다
   */
  abstract set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>

  /**
   * 캐시에서 데이터를 삭제합니다
   */
  abstract delete(key: string): Promise<void>

  /**
   * 패턴에 맞는 키들을 삭제합니다
   */
  abstract deleteByPattern(pattern: string): Promise<void>
}
