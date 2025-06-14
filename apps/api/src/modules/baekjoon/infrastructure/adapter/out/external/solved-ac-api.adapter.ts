import { 
  AdditionalUserInfo, 
  BojTag, 
  SolvedAcApiPort, 
  UserProfile 
} from "@/modules/baekjoon/application/ports/out/solved-ac-api.port"
import { ErrorUtils } from "@/shared/utils/error.util"
import { Injectable, Logger } from "@nestjs/common"
import { SolvedAcHttpClient } from "./solved-ac-http.client"

/**
 * solved.ac API 어댑터
 * SolvedAcApiPort를 구현하여 실제 solved.ac API와 통신
 */
@Injectable()
export class SolvedAcApiAdapter implements SolvedAcApiPort {
  private readonly logger = new Logger(SolvedAcApiAdapter.name)

  constructor(private readonly httpClient: SolvedAcHttpClient) {}

  /**
   * 사용자 존재 여부를 확인합니다
   */
  async checkUserExists(handle: string): Promise<boolean> {
    try {
      await this.getUserProfile(handle)
      return true
    } catch (error) {
      this.logger.debug(`사용자 존재 확인 실패: ${handle}`, { 
        error: ErrorUtils.getErrorMessage(error) 
      })
      return false
    }
  }

  /**
   * 사용자 프로필 정보를 조회합니다
   */
  async getUserProfile(handle: string): Promise<UserProfile> {
    try {
      this.logger.debug(`사용자 프로필 조회 시작: ${handle}`)
      
      const profile = await this.httpClient.get<UserProfile>("/user/show", { handle })
      
      this.logger.debug(`사용자 프로필 조회 성공: ${handle}`, {
        tier: profile.tier,
        rating: profile.rating,
        solvedCount: profile.solvedCount
      })
      
      return profile
    } catch (error) {
      this.logger.error(
        `baekjoon.solved-ac-api.${SolvedAcApiAdapter.name}.getUserProfile\n${ErrorUtils.getErrorMessage(error)}\n\n${ErrorUtils.getErrorStack(error)}`,
      )
      throw new Error(`사용자 프로필 조회 실패: ${handle}`)
    }
  }

  /**
   * 사용자 부가 정보를 조회합니다 (인증용)
   */
  async getUserAdditionalInfo(handle: string): Promise<AdditionalUserInfo> {
    try {
      this.logger.debug(`사용자 부가 정보 조회 시작: ${handle}`)
      
      const additionalInfo = await this.httpClient.get<AdditionalUserInfo>("/user/additional_info", { handle })
      
      this.logger.debug(`사용자 부가 정보 조회 성공: ${handle}`, {
        nameNative: additionalInfo.nameNative ? "설정됨" : "미설정"
      })
      
      return additionalInfo
    } catch (error) {
      this.logger.error(
        `baekjoon.solved-ac-api.${SolvedAcApiAdapter.name}.getUserAdditionalInfo\n${ErrorUtils.getErrorMessage(error)}\n\n${ErrorUtils.getErrorStack(error)}`,
      )
      throw new Error(`사용자 부가 정보 조회 실패: ${handle}`)
    }
  }

  /**
   * 사용자 태그 통계를 조회합니다
   */
  async getUserTagRatings(handle: string): Promise<BojTag[]> {
    try {
      this.logger.debug(`사용자 태그 통계 조회 시작: ${handle}`)
      
      const tagRatings = await this.httpClient.get<BojTag[]>("/user/tag_ratings", { handle })
      
      this.logger.debug(`사용자 태그 통계 조회 성공: ${handle}`, {
        tagCount: tagRatings.length
      })
      
      return tagRatings
    } catch (error) {
      this.logger.error(
        `baekjoon.solved-ac-api.${SolvedAcApiAdapter.name}.getUserTagRatings\n${ErrorUtils.getErrorMessage(error)}\n\n${ErrorUtils.getErrorStack(error)}`,
      )
      throw new Error(`사용자 태그 통계 조회 실패: ${handle}`)
    }
  }
}
