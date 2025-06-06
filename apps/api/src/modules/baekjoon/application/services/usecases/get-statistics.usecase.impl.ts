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
      BaekjoonUser.validateUserIdAndHandle({ userId, handle })

      const normalizedHandle = BaekjoonHandle.of(handle).value
      const existingUser = await this.baekjoonRepository.findBaekjoonUserByUserId(userId)

      if (!existingUser) {
        throw new NotFoundException("존재하지 않는 백준 ID입니다.")
      }

      // 동기화를 위한 api 호출 시간 체크
      if (!existingUser.possibleSync()) {
        const userTagStats = await this.baekjoonRepository.findTagStatisticsResultByHandle(normalizedHandle)
        if (!userTagStats) {
          throw new NotFoundException(`${handle}의 태그별 통계 정보가 존재하지 않습니다.`)
        }
        return userTagStats
      }

      // solved.ac API에서 태그별 통계 조회
      const [userProfile, tagRatingInfo] = await Promise.all([
        this.solvedAcApi.getUserProfile(normalizedHandle),
        this.solvedAcApi.getUserTagRatings(normalizedHandle),
      ])

      const topTags = tagRatingInfo
        .filter((tag) => tag.solvedCount > 0)
        .sort((a, b) => b.solvedCount - a.solvedCount)
        .map((tag) => ({
          tag: { key: tag.tag.key, name: tag.tag.displayNames?.[0]?.name || tag.tag.key },
          solvedCount: tag.solvedCount,
          rating: tag.rating,
        }))

      // API 응답을 DTO로 변환
      const apiResponse = {
        totalCount: userProfile.solvedCount,
        tierStats: {}, // TODO: tier 통계 정보 추가 필요
        topTags,
        lastSynced: new Date(),
      }

      const tagStaticsDto = this.baekjoonMapper.toTagStatisticsDto(apiResponse)

      const beackjoonUserResult = BaekjoonUser.fromSolvedAcApi({
        userId: userId,
        handle: userProfile?.handle,
        tier: userProfile?.tier,
        solvedCount: userProfile?.solvedCount,
      })

      // nosqldb에 저장
      await this.baekjoonRepository.saveBaekjoonUser(beackjoonUserResult)
      await this.baekjoonRepository.saveTagStatisticsResult(tagStaticsDto)

      return tagStaticsDto
    } catch (error) {
      this.logger.error(
        `baekjoon.service.${GetStatisticsUseCaseImpl.name}\n${ErrorUtils.getErrorMessage(error)}\n\n${ErrorUtils.getErrorStack(error)}`,
      )
      throw new BadRequestException("통계 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
    }
  }
}
