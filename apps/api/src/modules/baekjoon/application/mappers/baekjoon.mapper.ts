import { BaekjoonUser, VerificationSession } from "@/modules/baekjoon//domain/model"
import {
  BaekjoonProfileDto,
  CompleteVerificationDto,
  StartVerificationDto,
  TagDto,
  TagStatisticsDto,
  TopTagDto,
  VerificationStatusDto,
} from "@/modules/baekjoon/application/dtos"
import { Injectable } from "@nestjs/common"
import { plainToInstance } from "class-transformer"

/**
 * 백준 모듈 애플리케이션 매퍼
 * 도메인 엔티티와 애플리케이션 DTO 간의 변환을 담당
 */
@Injectable()
export class BaekjoonMapper {
  // ========== 도메인 엔티티 → DTO 변환 ==========

  /**
   * BaekjoonUser 도메인 엔티티 → BaekjoonProfileDto 매핑
   */
  toProfileDto(baekjoonUser: BaekjoonUser): BaekjoonProfileDto {
    const plainProfile = {
      handle: baekjoonUser.getHandleString(),
      tier: baekjoonUser.getCurrentTier().toString(),
      solvedCount: baekjoonUser.getSolvedCount(),
      lastUpdated: baekjoonUser.getLastSyncedAt(),
    }

    return plainToInstance(BaekjoonProfileDto, plainProfile, {
      excludeExtraneousValues: true,
    })
  }

  /**
   * VerificationSession 도메인 엔티티 → StartVerificationDto 매핑
   */
  toStartVerificationDto(session: VerificationSession): StartVerificationDto {
    const plainDto = {
      verificationString: session.getVerificationStringValue(),
      profileEditUrl: "https://solved.ac/settings/profile",
      message: "프로필 이름을 다음 문자열로 수정해주세요",
      expiresAt: session.getExpiresAt(),
    }

    return plainToInstance(StartVerificationDto, plainDto, {
      excludeExtraneousValues: true,
    })
  }

  /**
   * VerificationSession 도메인 엔티티 → CompleteVerificationDto 매핑
   */
  toCompleteVerificationDto(
    session: VerificationSession,
    success: boolean,
    message: string,
    tier?: string,
  ): CompleteVerificationDto {
    const plainDto = {
      success,
      message,
      handle: session.getHandleString(),
      tier,
    }

    return plainToInstance(CompleteVerificationDto, plainDto, {
      excludeExtraneousValues: true,
    })
  }

  /**
   * VerificationSession 도메인 엔티티 → VerificationStatusDto 매핑
   */
  toVerificationStatusDto(session: VerificationSession | null, baekjoonUser?: BaekjoonUser): VerificationStatusDto {
    if (!session) {
      // 세션이 없는 경우 (인증되지 않은 상태)
      const plainDto = {
        inProgress: false,
        status: baekjoonUser?.isVerified() ? "VERIFIED" : "PENDING",
        verifiedHandle: baekjoonUser?.getHandleString(),
        verifiedAt: baekjoonUser?.getVerifiedAt(),
        message: baekjoonUser?.isVerified() ? "백준 ID 인증이 완료되었습니다." : "백준 ID 인증이 필요합니다.",
      }

      return plainToInstance(VerificationStatusDto, plainDto, {
        excludeExtraneousValues: true,
      })
    }

    // 세션이 있는 경우
    const status = session.getStatus().toString().toUpperCase()
    const plainDto = {
      inProgress: session.isInProgress(),
      status,
      verificationString: session.isInProgress() ? session.getVerificationStringValue() : undefined,
      expiresAt: session.isInProgress() ? session.getExpiresAt() : undefined,
      verifiedHandle: session.isCompleted() ? session.getHandleString() : undefined,
      verifiedAt: session.isCompleted() ? session.getUpdatedAt() : undefined,
      message: this.getStatusMessage(status, session.isInProgress()),
    }

    return plainToInstance(VerificationStatusDto, plainDto, {
      excludeExtraneousValues: true,
    })
  }

  /**
   * 외부 API 응답 → TagStatisticsDto 매핑
   */
  toTagStatisticsDto(apiResponse: {
    totalCount: number
    tierStats: Record<string, number>
    topTags: Array<{
      tag: { key: string; name: string }
      solvedCount: number
      rating: number
    }>
    lastSynced?: Date
  }): TagStatisticsDto {
    const topTags = apiResponse.topTags.map((tagData) => {
      const tagDto = plainToInstance(TagDto, tagData.tag, {
        excludeExtraneousValues: true,
      })

      return plainToInstance(
        TopTagDto,
        {
          tag: tagDto,
          solvedCount: tagData.solvedCount,
          rating: tagData.rating,
        },
        { excludeExtraneousValues: true },
      )
    })

    const plainDto = {
      totalCount: apiResponse.totalCount,
      tierStats: apiResponse.tierStats,
      topTags,
      lastSynced: apiResponse.lastSynced || new Date(),
    }

    return plainToInstance(TagStatisticsDto, plainDto, {
      excludeExtraneousValues: true,
    })
  }

  /**
   * 상태별 메시지 생성
   */
  private getStatusMessage(status: string, inProgress: boolean): string {
    switch (status) {
      case "PENDING":
        return inProgress ? "인증이 진행 중입니다. 이름을 확인해주세요." : "백준 ID 인증이 필요합니다."
      case "VERIFIED":
      case "COMPLETED":
        return "백준 ID 인증이 완료되었습니다."
      case "FAILED":
        return "인증에 실패했습니다. 다시 시도해주세요."
      case "EXPIRED":
        return "인증 세션이 만료되었습니다. 새로 시작해주세요."
      default:
        return "인증 상태를 확인할 수 없습니다."
    }
  }
}
