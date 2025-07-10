import { Injectable } from "@nestjs/common"

import {
  BaekjoonProfileOutputDto,
  CompleteVerificationOutputDto,
  StartVerificationOutputDto,
  TagStatisticsOutputDto,
} from "@/modules/baekjoon/application/dtos"
import { VerificationStatusType } from "@/modules/baekjoon/domain/vo"
import {
  BaekjoonProfileResponseDto,
  TagInfoDto,
  TagStatisticsResponseDto,
  VerificationResultResponseDto,
  VerificationStatusResponseDto,
} from "@/modules/baekjoon/infrastructure/dtos/response"

@Injectable()
export class BaekjoonResponseMapper {
  toVerificationStatusResponse(dto: StartVerificationOutputDto, handle: string): VerificationStatusResponseDto {
    return {
      sessionId: dto.sessionId,
      handle,
      verificationString: dto.verificationString,
      status: VerificationStatusType.PENDING,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
      expiresAt: dto.expiresAt.toISOString(),
    }
  }

  toVerificationResultResponse(dto: CompleteVerificationOutputDto): VerificationResultResponseDto {
    return {
      success: dto.success,
      sessionId: dto.sessionId,
      status: dto.success ? VerificationStatusType.COMPLETED : VerificationStatusType.FAILED,
      message: dto.message,
      completedAt: dto.success ? new Date().toISOString() : undefined,
      errorReason: !dto.success ? dto.message : undefined,
      attempts: dto.attempts,
      remainingAttempts: Math.max(0, 3 - dto.attempts),
    }
  }

  toProfileResponse(dto: BaekjoonProfileOutputDto, userId: string = ""): BaekjoonProfileResponseDto {
    // Platinum 3 (레이팅 2000) 이상이면 멘토 자격
    const isMentorEligible = dto.rating >= 2000

    return {
      userId,
      handle: dto.handle,
      tier: dto.tier,
      rating: dto.rating,
      rank: dto.rank,
      solvedCount: dto.solvedCount,
      profileImageUrl: dto.profileImageUrl,
      bio: dto.bio,
      lastUpdated: new Date().toISOString(),
      isMentorEligible,
    }
  }

  toStatisticsResponse(dto: TagStatisticsOutputDto, userId: string = ""): TagStatisticsResponseDto {
    // TopTagDto를 TagInfoDto로 변환
    const tags: TagInfoDto[] = dto.tags.map((topTag, index) => ({
      tagId: index + 1, // 임시 ID
      key: topTag.tag.key,
      nameKo: topTag.tag.name,
      problemCount: topTag.solvedCount,
      rating: 1200, // 임시 레이팅
      ratingByProblemsSum: topTag.solvedCount * 1200,
      ratingByClass: 1100,
      ratingBySolvedCount: 1300,
    }))

    return {
      userId,
      handle: dto.handle,
      tags,
      totalTagCount: dto.totalTagCount,
      totalSolvedCount: dto.totalSolvedCount,
      averageRating: 1250, // 임시 평균 레이팅
      lastUpdated: new Date().toISOString(),
    }
  }
}
