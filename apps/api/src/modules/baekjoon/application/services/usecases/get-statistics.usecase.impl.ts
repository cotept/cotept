import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common"

import { BaekjoonDomainMapper } from "../../mappers"
import { RateLimitPort } from "../../ports"
import { GetStatisticsUseCase } from "../../ports/in/get-statistics.usecase"
import { BaekjoonProfileRepositoryPort } from "../../ports/out/baekjoon-profile-repository.port"
import { BaekjoonStatisticsRepositoryPort } from "../../ports/out/baekjoon-statistics-repository.port"
import { CachePort } from "../../ports/out/cache.port"
import { SolvedAcApiPort } from "../../ports/out/solved-ac-api.port"

import { GetStatisticsInputDto, TagStatisticsOutputDto } from "@/modules/baekjoon/application/dtos"
import { BaekjoonUser } from "@/modules/baekjoon/domain/model"
import { BaekjoonHandle } from "@/modules/baekjoon/domain/vo"
import { ErrorUtils } from "@/shared/utils/error.util"

/**
 * 통계 조회 유스케이스 구현
 * 백준 사용자의 태그별 통계를 조회하는 비즈니스 로직
 */
@Injectable()
export class GetStatisticsUseCaseImpl implements GetStatisticsUseCase {
  private readonly logger = new Logger(GetStatisticsUseCaseImpl.name)

  constructor(
    @Inject("BaekjoonProfileRepositoryPort")
    private readonly profileRepository: BaekjoonProfileRepositoryPort,
    @Inject("BaekjoonStatisticsRepositoryPort")
    private readonly statisticsRepository: BaekjoonStatisticsRepositoryPort,
    @Inject("SolvedAcApiPort")
    private readonly solvedAcApi: SolvedAcApiPort,
    @Inject("CachePort")
    private readonly cacheService: CachePort,
    @Inject("RateLimitPort")
    private readonly rateLimitAdapter: RateLimitPort,
    private readonly baekjoonMapper: BaekjoonDomainMapper,
  ) {}

  async execute(inputDto: GetStatisticsInputDto): Promise<TagStatisticsOutputDto> {
    try {
      const { userId, handle } = inputDto

      // 1단계: 입력값 검증
      this.validateInput(userId, handle)

      // 2단계: 사용자 존재 여부 확인
      const existingUser = await this.findExistingUser(userId)

      // 3단계: 동기화 필요성 확인 및 캐시된 데이터 반환 시도
      const cachedData = await this.tryGetCachedStatistics(existingUser, handle)
      if (cachedData) return cachedData

      // 4단계: API 데이터 조회 및 통계 생성
      const tagStatisticsDto = await this.fetchAndCreateStatistics(handle, userId)

      return tagStatisticsDto
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * 입력값 검증
   */
  private validateInput(userId: string, handle: string): void {
    BaekjoonUser.validateUserIdAndHandle({ userId, handle })
  }

  /**
   * 기존 사용자 조회
   */
  private async findExistingUser(userId: string): Promise<BaekjoonUser> {
    const existingUser = await this.profileRepository.findByUserId(userId)

    if (!existingUser) {
      throw new NotFoundException("존재하지 않는 백준 ID입니다.")
    }

    return existingUser
  }

  /**
   * 캐시된 통계 데이터 조회 시도
   */
  private async tryGetCachedStatistics(user: BaekjoonUser, handle: string): Promise<TagStatisticsOutputDto | null> {
    // 동기화가 필요하지 않은 경우 캐시된 데이터 반환
    if (!this.needsSync(user)) {
      return await this.getCachedStatistics(handle)
    }

    return null
  }

  /**
   * 동기화 필요성 확인
   */
  private needsSync(user: BaekjoonUser): boolean {
    return user.possibleSync()
  }

  /**
   * 캐시된 통계 데이터 조회
   */
  private async getCachedStatistics(handle: string): Promise<TagStatisticsOutputDto | null> {
    const normalizedHandle = this.normalizeHandle(handle)
    const userTagStats = await this.statisticsRepository.findTagStatisticsByHandle(normalizedHandle)

    if (!userTagStats) {
      return null
    }

    // BojTag[]를 TagStatisticsOutputDto로 변환
    return this.convertBojTagsToStatistics(userTagStats)
  }

  /**
   * 핸들 정규화
   */
  private normalizeHandle(handle: string): string {
    return BaekjoonHandle.of(handle).value
  }

  /**
   * API 데이터 조회 및 통계 생성
   */
  private async fetchAndCreateStatistics(handle: string, userId: string): Promise<TagStatisticsOutputDto> {
    const normalizedHandle = this.normalizeHandle(handle)

    // API 데이터 조회
    const apiData = await this.fetchApiData(normalizedHandle)

    // 통계 데이터 변환
    const tagStatisticsDto = this.transformApiDataToStatistics(apiData)

    // 사용자 데이터 생성 및 저장
    await this.saveUserAndStatistics(apiData, tagStatisticsDto, userId)

    return tagStatisticsDto
  }

  /**
   * solved.ac API 데이터 조회
   */
  private async fetchApiData(normalizedHandle: string): Promise<{
    userProfile: any
    tagRatingInfo: any[]
  }> {
    const [userProfile, tagRatingInfo] = await Promise.all([
      this.solvedAcApi.getUserProfile(normalizedHandle),
      this.solvedAcApi.getUserTagRatings(normalizedHandle),
    ])

    return { userProfile, tagRatingInfo }
  }

  /**
   * API 데이터를 통계 DTO로 변환
   */
  private transformApiDataToStatistics(apiData: { userProfile: any; tagRatingInfo: any[] }): TagStatisticsOutputDto {
    const { userProfile, tagRatingInfo } = apiData

    const topTags = this.processTopTags(tagRatingInfo)

    const apiResponse = {
      totalCount: userProfile.solvedCount,
      tierStats: this.buildTierStats(userProfile), // tier 통계 정보 추가
      topTags,
      lastSynced: new Date(),
    }

    return this.baekjoonMapper.toTagStatisticsOutputDto(apiResponse)
  }

  /**
   * tier 통계 정보 생성
   */
  private buildTierStats(userProfile: any): any {
    return {
      currentTier: userProfile.tier || 0,
      currentRating: userProfile.rating || 0,
      maxTier: userProfile.maxStreak || 0,
      solvedCount: userProfile.solvedCount || 0,
    }
  }

  /**
   * 태그 정보 처리 및 정렬
   */
  private processTopTags(tagRatingInfo: any[]): Array<{
    tag: { key: string; name: string }
    solvedCount: number
    rating: number
  }> {
    return tagRatingInfo
      .filter((tag) => tag.solvedCount > 0)
      .sort((a, b) => b.solvedCount - a.solvedCount)
      .map((tag) => ({
        tag: {
          key: tag.tag.key,
          name: tag.tag.displayNames?.[0]?.name || tag.tag.key,
        },
        solvedCount: tag.solvedCount,
        rating: tag.rating,
      }))
  }

  /**
   * 사용자 데이터 및 통계 저장
   */
  private async saveUserAndStatistics(
    apiData: { userProfile: any },
    tagStatisticsDto: TagStatisticsOutputDto,
    userId: string,
  ): Promise<void> {
    // 백준 사용자 데이터 생성
    const baekjoonUserResult = this.createBaekjoonUserFromApi(apiData.userProfile, userId)

    // 저장 작업들을 병렬로 실행
    await Promise.all([
      this.saveBaekjoonUser(baekjoonUserResult), 
      this.saveTagStatistics(tagStatisticsDto, userId, apiData.userProfile.handle)
    ])
  }

  /**
   * API 데이터로부터 백준 사용자 생성
   */
  private createBaekjoonUserFromApi(userProfile: any, userId: string): BaekjoonUser {
    return BaekjoonUser.fromSolvedAcApi({
      userId: userId,
      handle: userProfile?.handle,
      tier: userProfile?.tier,
      solvedCount: userProfile?.solvedCount,
    })
  }

  /**
   * 백준 사용자 저장
   */
  private async saveBaekjoonUser(baekjoonUser: BaekjoonUser): Promise<void> {
    await this.profileRepository.save(baekjoonUser)
  }

  /**
   * 태그 통계 저장
   */
  private async saveTagStatistics(tagStatistics: TagStatisticsOutputDto, userId: string, handle: string): Promise<void> {
    // TagStatisticsOutputDto를 BojTag[]로 변환 필요
    const bojTags = this.convertStatisticsToBojTags(tagStatistics)
    await this.statisticsRepository.saveTagStatistics(userId, handle, bojTags)
  }

  /**
   * BojTag[]를 TagStatisticsOutputDto로 변환
   */
  private convertBojTagsToStatistics(bojTags: any[]): TagStatisticsOutputDto {
    const topTags = bojTags
      .filter((tag) => tag.solvedCount > 0)
      .sort((a, b) => b.solvedCount - a.solvedCount)
      .map((tag) => ({
        tag: {
          key: tag.tag.key,
          name: tag.tag.displayNames?.[0]?.name || tag.tag.key,
        },
        solvedCount: tag.solvedCount,
        rating: tag.rating,
      }))

    const totalCount = bojTags.reduce((sum, tag) => sum + tag.solvedCount, 0)

    const apiResponse = {
      totalCount,
      tierStats: {},
      topTags,
      lastSynced: new Date(),
    }

    return this.baekjoonMapper.toTagStatisticsOutputDto(apiResponse)
  }

  /**
   * TagStatisticsOutputDto를 BojTag[]로 변환
   */
  private convertStatisticsToBojTags(statistics: TagStatisticsOutputDto): any[] {
    // 임시 구현 - 실제로는 DTO의 구조에 맞게 변환 필요
    return []
  }

  async executeByHandle(handle: string): Promise<TagStatisticsOutputDto> {
    try {
      // 1단계: 입력값 검증
      if (!handle) {
        throw new BadRequestException("백준 ID(handle)는 필수입니다.")
      }

      // 2단계: 태그 통계 조회 (공개 조회이므로 사용자 ID 없이)
      return await this.fetchAndCreateStatistics(handle, "")
    } catch (error) {
      this.logger.error(
        `baekjoon.service.${GetStatisticsUseCaseImpl.name}\n${ErrorUtils.getErrorMessage(error)}\n\n${ErrorUtils.getErrorStack(error)}`,
      )
      throw error
    }
  }

  /**
   * 에러 처리 및 로깅
   */
  private handleError(error: unknown): never {
    this.logger.error(
      `baekjoon.service.${GetStatisticsUseCaseImpl.name}\n${ErrorUtils.getErrorMessage(error)}\n\n${ErrorUtils.getErrorStack(error)}`,
    )
    throw new BadRequestException("통계 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
  }
}
