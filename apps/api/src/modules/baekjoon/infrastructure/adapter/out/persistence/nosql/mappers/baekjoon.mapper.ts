import { Injectable } from "@nestjs/common"

import { BaekjoonTagDocument, BojTag } from "../schemas/baekjoon.schema"

/**
 * 백준 태그 캐시 매퍼
 * BaseNoSQLMapper를 상속하지 않고 직접 구현 (더 깔끔함)
 */
@Injectable()
export class BaekjoonNosqlMapper {
  constructor() {}

  /**
   * NoSQL 문서를 도메인으로 변환 (API 응답 그대로 반환)
   */
  toDomain(document: BaekjoonTagDocument): BojTag[] {
    return document.data.apiResponse
  }

  /**
   * 도메인를 NoSQL 문서로 변환
   */
  toDocument(userId: string, handle: string, apiResponse: BojTag[], fetchedAt: string): BaekjoonTagDocument {
    return {
      userId,
      timestamp: this.getCurrentTimestamp(),
      type: "baekjoon_tags",
      data: {
        handle,
        apiResponse, // solved.ac API 응답 그대로!
        fetchedAt,
      },
    }
  }

  /**
   * solved.ac API 응답을 NoSQL 문서로 변환
   */
  fromApiResponse(userId: string, handle: string, apiResponse: BojTag[]): BaekjoonTagDocument {
    const now = this.getCurrentTimestamp()

    return {
      userId,
      type: "baekjoon_tags",
      timestamp: now,
      data: {
        handle,
        apiResponse, // solved.ac API 응답 그대로 저장
        fetchedAt: now,
      },
    }
  }

  /**
   * NoSQL 문서에서 메타데이터 추출
   */
  extractMetadata(document: BaekjoonTagDocument): {
    handle: string
    fetchedAt: Date
    totalTags: number
  } {
    const tags = document.data.apiResponse
    const totalTags = tags.length

    return {
      handle: document.data.handle,
      fetchedAt: new Date(document.data.fetchedAt),
      totalTags,
    }
  }
  /**
   * 현재 시간을 ISO 문자열로 반환
   */
  private getCurrentTimestamp(): string {
    return new Date().toISOString()
  }
}
