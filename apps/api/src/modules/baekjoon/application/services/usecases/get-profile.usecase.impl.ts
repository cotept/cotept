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

      // 1. 핸들 유효성 검사
      BaekjoonUser.validateUserIdAndHandle({ userId, handle })

      const normalizedHandle = BaekjoonHandle.of(handle).value

      // 2. 저장된 백준 사용자 정보 조회
      const existingUser = await this.baekjoonRepository.findBaekjoonUserByUserId(userId)

      // 3. 저장된 데이터가 없으면 API에서 조회
      if (!existingUser) {
        const solvedAcProfile = await this.solvedAcApi.getUserProfile(normalizedHandle)
        if (!solvedAcProfile) {
          throw new BadRequestException("존재하지 않는 백준 ID입니다.")
        }
        // 3-1. solved.ac API에서 프로필 조회 결과를 BaekjoonUser로 변환
        const currentUser = BaekjoonUser.fromSolvedAcApi({ ...solvedAcProfile, userId })

        // 저장
        await this.baekjoonRepository.saveBaekjoonUser(currentUser)

        // DTO로 변환하여 반환
        return this.baekjoonMapper.toProfileDto(currentUser)
      }

      // 4. 저장된 데이터가 있는 경우 DTO로 변환하여 반환
      return this.baekjoonMapper.toProfileDto(existingUser)
    } catch (error) {
      this.logger.error(
        `baekjoon.service.${GetProfileUseCaseImpl.name}\n${ErrorUtils.getErrorMessage(error)}\n\n${ErrorUtils.getErrorStack(error)}`,
      )
      throw new BadRequestException("백준 프로파일 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
    }
  }
}
