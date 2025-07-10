import { Injectable, Logger } from "@nestjs/common"

import {
  CompleteVerificationInputDto,
  GetProfileInputDto,
  GetStatisticsInputDto,
  StartVerificationInputDto,
} from "@/modules/baekjoon/application/dtos"
import { BaekjoonResponseMapper } from "@/modules/baekjoon/application/mappers"
import {
  CompleteVerificationUseCase,
  GetProfileUseCase,
  GetStatisticsUseCase,
  StartVerificationUseCase,
} from "@/modules/baekjoon/application/ports/in"
import {
  BaekjoonProfileResponseDto,
  TagStatisticsResponseDto,
  VerificationResultResponseDto,
  VerificationStatusResponseDto,
} from "@/modules/baekjoon/infrastructure/dtos/response"

/**
 * 백준 관련 파사드 서비스
 * 컨트롤러와 유스케이스 사이의 중간 레이어로 동작하며 컨트롤러의 복잡성을 줄이는 역할을 합니다.
 */
@Injectable()
export class BaekjoonFacadeService {
  private readonly logger = new Logger(BaekjoonFacadeService.name)

  constructor(
    private readonly startVerificationUseCase: StartVerificationUseCase,
    private readonly completeVerificationUseCase: CompleteVerificationUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly getStatisticsUseCase: GetStatisticsUseCase,
    private readonly responseMapper: BaekjoonResponseMapper,
  ) {}

  /**
   * 백준 ID 인증 시작
   */
  async startVerification(inputDto: StartVerificationInputDto): Promise<VerificationStatusResponseDto> {
    const result = await this.startVerificationUseCase.execute(inputDto)
    return this.responseMapper.toVerificationStatusResponse(result, inputDto.handle)
  }

  /**
   * 백준 ID 인증 완료
   */
  async completeVerification(inputDto: CompleteVerificationInputDto): Promise<VerificationResultResponseDto> {
    const result = await this.completeVerificationUseCase.execute(inputDto)
    return this.responseMapper.toVerificationResultResponse(result)
  }

  /**
   * 인증 상태 조회
   */
  async getVerificationStatus(userId: string): Promise<VerificationStatusResponseDto> {
    // TODO: UseCase 구현 필요
    throw new Error("Method not implemented")
  }

  /**
   * 백준 사용자 프로필 조회
   */
  async getProfile(inputDto: GetProfileInputDto): Promise<BaekjoonProfileResponseDto> {
    const result = await this.getProfileUseCase.execute(inputDto)
    return this.responseMapper.toProfileResponse(result, inputDto.userId)
  }

  /**
   * 백준 사용자 태그별 통계 조회
   */
  async getStatistics(inputDto: GetStatisticsInputDto): Promise<TagStatisticsResponseDto> {
    const result = await this.getStatisticsUseCase.execute(inputDto)
    return this.responseMapper.toStatisticsResponse(result, inputDto.userId)
  }
}
