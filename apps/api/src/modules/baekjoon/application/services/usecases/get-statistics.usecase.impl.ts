import { BaekjoonUser } from "@/modules/baekjoon/domain/model"
import { BaekjoonHandle } from "@/modules/baekjoon/domain/vo"
import { GetTagStatisticsRequestDto } from "@/modules/baekjoon/infrastructure/dtos/request"
import { ErrorUtils } from "@/shared/utils/error.util"
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { TagStatisticsDto } from "../../dtos"
import { BaekjoonMapper } from "../../mappers"
import { RateLimitPort } from "../../ports"
import { GetStatisticsUseCase } from "../../ports/in/get-statistics.usecase"
import { BaekjoonRepositoryPort } from "../../ports/out/baekjoon-repository.port"
import { CachePort } from "../../ports/out/cache.port"
import { SolvedAcApiPort } from "../../ports/out/solved-ac-api.port"

/**
 * 통계 조회 유스케이스 구현
 * 백준 사용자의 태그별 통계를 조회하는 비즈니스 로직
 */
@Injectable()
export class GetStatisticsUseCaseImpl implements GetStatisticsUseCase {
  private readonly logger = new Logger(GetStatisticsUseCaseImpl.name)

  constructor(
    @Inject("BaekjoonRepositoryPort")
    private readonly baekjoonRepository: BaekjoonRepositoryPort,
    @Inject("SolvedAcApiPort")
    private readonly solvedAcApi: SolvedAcApiPort,
    @Inject("CachePort")
    private readonly cacheService: CachePort,
    @Inject("RateLimitPort")
    private readonly rateLimitAdapter: RateLimitPort,
    private readonly baekjoonMapper: BaekjoonMapper,
  ) {}

  async execute(requestDto: GetTagStatisticsRequestDto): Promise<TagStatisticsDto> {
    try {
      const { email: userId, handle } = requestDto

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
    const existingUser = await this.baekjoonRepository.findBaekjoonUserByUserId(userId)

    if (!existingUser) {
      throw new NotFoundException("존재하지 않는 백준 ID입니다.")
    }

    return existingUser
  }

  /**
   * 캐시된 통계 데이터 조회 시도
   */
  private async tryGetCachedStatistics(user: BaekjoonUser, handle: string): Promise<TagStatisticsDto | null> {
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
  private async getCachedStatistics(handle: string): Promise<TagStatisticsDto> {
    const normalizedHandle = this.normalizeHandle(handle)
    const userTagStats = await this.baekjoonRepository.findTagStatisticsResultByHandle(normalizedHandle)

    if (!userTagStats) {
      throw new NotFoundException(`${handle}의 태그별 통계 정보가 존재하지 않습니다.`)
    }

    return userTagStats
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
  private async fetchAndCreateStatistics(handle: string, userId: string): Promise<TagStatisticsDto> {
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
  private transformApiDataToStatistics(apiData: { userProfile: any; tagRatingInfo: any[] }): TagStatisticsDto {
    const { userProfile, tagRatingInfo } = apiData

    const topTags = this.processTopTags(tagRatingInfo)

    const apiResponse = {
      totalCount: userProfile.solvedCount,
      tierStats: {}, // TODO: tier 통계 정보 추가 필요
      topTags,
      lastSynced: new Date(),
    }

    return this.baekjoonMapper.toTagStatisticsDto(apiResponse)
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
    tagStatisticsDto: TagStatisticsDto,
    userId: string,
  ): Promise<void> {
    // 백준 사용자 데이터 생성
    const baekjoonUserResult = this.createBaekjoonUserFromApi(apiData.userProfile, userId)

    // 저장 작업들을 병렬로 실행
    await Promise.all([this.saveBaekjoonUser(baekjoonUserResult), this.saveTagStatistics(tagStatisticsDto)])
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
    await this.baekjoonRepository.saveBaekjoonUser(baekjoonUser)
  }

  /**
   * 태그 통계 저장
   */
  private async saveTagStatistics(tagStatistics: TagStatisticsDto): Promise<void> {
    await this.baekjoonRepository.saveTagStatisticsResult(tagStatistics)
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
