import { BaekjoonStatisticsRepositoryPort } from "@/modules/baekjoon/application/ports/out/baekjoon-statistics-repository.port"
import { Injectable } from "@nestjs/common"
import { BaekjoonTagNosqlRepository } from "./repositories/baekjoon-nosql.repository"
import { BojTag } from "./schemas/baekjoon.schema"

/**
 * 백준 태그 캐시 어댑터 - 매우 간단한 구현
 */
@Injectable()
export class BaekjoonTagNosqlAdapter implements BaekjoonStatisticsRepositoryPort {
  constructor(private readonly repository: BaekjoonTagNosqlRepository) {}

  saveTagStatistics(userId: string, handle: string, tags: BojTag[]): Promise<void> {
    return this.repository.saveApiResponse({ userId, handle, apiResponse: tags })
  }

  findTagStatisticsByUserId(userId: string): Promise<BojTag[] | null> {
    return this.repository.findByUserId(userId)
  }

  findTagStatisticsByHandle(handle: string): Promise<BojTag[] | null> {
    return this.repository.findByHandle(handle)
  }

  updateTagStatistics(userId: string, handle: string, tags: BojTag[]): Promise<void> {
    return this.repository.updateTagData({ userId, handle, apiResponse: tags })
  }

  deleteTagStatistics(userId: string): Promise<void> {
    return this.repository.deleteByUserId(userId)
  }
}
