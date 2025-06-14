import {
  CompleteVerificationUseCase,
  GetProfileUseCase,
  GetStatisticsUseCase,
  StartVerificationUseCase,
} from "@/modules/baekjoon/application/ports/in"
import {
  CompleteVerificationRequestDto,
  GetProfileRequestDto,
  GetTagStatisticsRequestDto,
  StartVerificationRequestDto,
} from "@/modules/baekjoon/infrastructure/dtos/request"
import { ApiResponse } from "@/shared/infrastructure/dto/api-response.dto"
import { HttpStatus, Injectable, Logger } from "@nestjs/common"

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
  ) {}

  /**
   * 백준 ID 인증 시작
   */
  async startVerification(requestDto: StartVerificationRequestDto) {
    const result = await this.startVerificationUseCase.execute(requestDto)

    return new ApiResponse(HttpStatus.OK, true, "백준 ID 인증이 시작되었습니다.", result)
  }

  /**
   * 백준 ID 인증 완료
   */
  async completeVerification(requestDto: CompleteVerificationRequestDto) {
    const result = await this.completeVerificationUseCase.execute(requestDto)

    return new ApiResponse(
      result.success ? HttpStatus.OK : HttpStatus.BAD_REQUEST,
      result.success,
      result.message,
      result,
    )
  }

  /**
   * 백준 사용자 프로필 조회
   */
  async getProfile(requestDto: GetProfileRequestDto) {
    const result = await this.getProfileUseCase.execute(requestDto)

    return new ApiResponse(HttpStatus.OK, true, "백준 프로필 조회 성공", result)
  }

  /**
   * 백준 사용자 태그별 통계 조회
   */
  async getStatistics(requestDto: GetTagStatisticsRequestDto) {
    const result = await this.getStatisticsUseCase.execute(requestDto)

    return new ApiResponse(HttpStatus.OK, true, "백준 통계 조회 성공", result)
  }
}
