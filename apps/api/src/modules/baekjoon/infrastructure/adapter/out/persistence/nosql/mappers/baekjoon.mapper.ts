import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { BaekjoonTagCacheDocument, BojTag } from "../schemas/baekjoon.schema"

/**
 * 백준 태그 캐시 매퍼
 * BaseNoSQLMapper를 상속하지 않고 직접 구현 (더 깔끔함)
 */
@Injectable()
export class BaekjoonNosqlMapper {
  private readonly ttlHours: number

  constructor(private readonly configService: ConfigService) {
    this.ttlHours = this.configService.get<number>("nosql.ttl.baekjoon_tag_cache", 24)
  }

  /**
   * NoSQL 문서를 도메인으로 변환 (API 응답 그대로 반환)
   */
  toDomain(document: BaekjoonTagCacheDocument): BojTag[] {
    return document.data.apiResponse
  }

  /**
   * solved.ac API 응답을 NoSQL 문서로 변환
   */
  fromApiResponse(
    userId: string,
    handle: string,
    apiResponse: BojTag[],
    responseTime?: number,
  ): BaekjoonTagCacheDocument {
    const now = this.getCurrentTimestamp()

    return {
      userId,
      type: "tag_cache",
      timestamp: now,
      data: {
        handle,
        apiResponse, // solved.ac API 응답 그대로 저장
        cachedAt: now,
        responseTime,
      },
      ttl: this.calculateTTL(this.ttlHours),
    }
  }

  /**
   * 현재 시간을 ISO 문자열로 반환
   */
  private getCurrentTimestamp(): string {
    return new Date().toISOString()
  }

  /**
   * TTL 계산 (Unix 타임스탬프, 초 단위)
   */
  private calculateTTL(hours: number): number {
    return Math.floor(Date.now() / 1000) + hours * 60 * 60
  }

  /**
   * 캐시 문서에서 메타데이터 추출
   */
  extractMetadata(document: BaekjoonTagCacheDocument): {
    handle: string
    cachedAt: Date
    totalTags: number
    averageRating: number
    responseTime?: number
  } {
    const tags = document.data.apiResponse
    const totalTags = tags.length
    const averageRating = totalTags > 0 ? tags.reduce((sum, tag) => sum + tag.rating, 0) / totalTags : 0

    return {
      handle: document.data.handle,
      cachedAt: new Date(document.data.cachedAt),
      totalTags,
      averageRating: Math.round(averageRating * 100) / 100,
      responseTime: document.data.responseTime,
    }
  }

  /**
   * 상위 N개 태그 추출 (레이팅 순)
   */
  getTopTags(document: BaekjoonTagCacheDocument, limit: number = 10): BojTag[] {
    return document.data.apiResponse.sort((a, b) => b.rating - a.rating).slice(0, limit)
  }

  /**
   * 태그명을 언어별로 추출
   */
  getTagDisplayName(tag: BojTag, preferredLanguage: string = "ko"): string {
    const displayName = tag.tag.displayNames.find((d) => d.language === preferredLanguage)
    if (displayName) return displayName.name

    const englishName = tag.tag.displayNames.find((d) => d.language === "en")
    if (englishName) return englishName.name

    return tag.tag.displayNames[0]?.name || tag.tag.key
  }
}
