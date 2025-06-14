import { BaekjoonHandle } from "@/modules/baekjoon/domain/vo"
import { GetProfileRequestDto } from "@/modules/baekjoon/infrastructure/dtos/request"
import { ErrorUtils } from "@/shared/utils/error.util"
import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common"
import { BaekjoonUser } from "../../../domain/model/baekjoon-user.model"
import { BaekjoonProfileDto } from "../../dtos"
import { BaekjoonMapper } from "../../mappers"
import { GetProfileUseCase } from "../../ports/in/get-profile.usecase"
import { BaekjoonRepositoryPort } from "../../ports/out/baekjoon-repository.port"
import { SolvedAcApiPort } from "../../ports/out/solved-ac-api.port"

/**
 * 프로필 조회 유스케이스 구현
 * 백준 사용자 프로필을 조회하는 비즈니스 로직
 */
@Injectable()
export class GetProfileUseCaseImpl implements GetProfileUseCase {
  private readonly logger = new Logger(GetProfileUseCaseImpl.name)

  constructor(
    @Inject("BaekjoonRepositoryPort")
    private readonly baekjoonRepository: BaekjoonRepositoryPort,
    @Inject("SolvedAcApiPort")
    private readonly solvedAcApi: SolvedAcApiPort,
    private readonly baekjoonMapper: BaekjoonMapper,
  ) {}

  async execute(requestDto: GetProfileRequestDto): Promise<BaekjoonProfileDto> {
    try {
      const { email: userId, handle } = requestDto

      // 1단계: 입력값 검증
      this.validateInput(userId, handle)

      // 2단계: 핸들 정규화
      const normalizedHandle = this.normalizeHandle(handle)

      // 3단계: 기존 사용자 조회
      const existingUser = await this.findExistingUser(userId)

      // 4단계: 사용자 데이터 획득 (기존 데이터 or API 조회)
      const baekjoonUser = await this.getOrCreateBaekjoonUser(existingUser, normalizedHandle, userId)

      // 5단계: DTO 변환 및 반환
      return this.convertToProfileDto(baekjoonUser)
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
   * 핸들 정규화
   */
  private normalizeHandle(handle: string): string {
    return BaekjoonHandle.of(handle).value
  }

  /**
   * 기존 사용자 조회
   */
  private async findExistingUser(userId: string): Promise<BaekjoonUser | null> {
    return await this.baekjoonRepository.findBaekjoonUserByUserId(userId)
  }

  /**
   * 백준 사용자 데이터 획득 (기존 데이터 반환 또는 새로 생성)
   */
  private async getOrCreateBaekjoonUser(
    existingUser: BaekjoonUser | null,
    normalizedHandle: string,
    userId: string,
  ): Promise<BaekjoonUser> {
    if (existingUser) {
      return existingUser
    }

    return await this.createBaekjoonUserFromApi(normalizedHandle, userId)
  }

  /**
   * API에서 사용자 데이터 조회 및 백준 사용자 생성
   */
  private async createBaekjoonUserFromApi(normalizedHandle: string, userId: string): Promise<BaekjoonUser> {
    // API에서 프로필 조회
    const solvedAcProfile = await this.fetchSolvedAcProfile(normalizedHandle)

    // 백준 사용자 객체 생성
    const baekjoonUser = this.createBaekjoonUserFromProfile(solvedAcProfile, userId)

    // 사용자 데이터 저장
    await this.saveBaekjoonUser(baekjoonUser)

    return baekjoonUser
  }

  /**
   * solved.ac API에서 프로필 조회
   */
  private async fetchSolvedAcProfile(normalizedHandle: string): Promise<any> {
    const solvedAcProfile = await this.solvedAcApi.getUserProfile(normalizedHandle)

    if (!solvedAcProfile) {
      throw new BadRequestException("존재하지 않는 백준 ID입니다.")
    }

    return solvedAcProfile
  }

  /**
   * solved.ac 프로필로부터 백준 사용자 객체 생성
   */
  private createBaekjoonUserFromProfile(solvedAcProfile: any, userId: string): BaekjoonUser {
    return BaekjoonUser.fromSolvedAcApi({
      ...solvedAcProfile,
      userId,
    })
  }

  /**
   * 백준 사용자 저장
   */
  private async saveBaekjoonUser(baekjoonUser: BaekjoonUser): Promise<void> {
    await this.baekjoonRepository.saveBaekjoonUser(baekjoonUser)
  }

  /**
   * 백준 사용자를 프로필 DTO로 변환
   */
  private convertToProfileDto(baekjoonUser: BaekjoonUser): BaekjoonProfileDto {
    return this.baekjoonMapper.toProfileDto(baekjoonUser)
  }

  /**
   * 에러 처리 및 로깅
   */
  private handleError(error: unknown): never {
    this.logger.error(
      `baekjoon.service.${GetProfileUseCaseImpl.name}\n${ErrorUtils.getErrorMessage(error)}\n\n${ErrorUtils.getErrorStack(error)}`,
    )
    throw new BadRequestException("백준 프로파일 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
  }
}
