import { Injectable } from "@nestjs/common"

import {
  CompleteVerificationInputDto,
  GetProfileInputDto,
  GetStatisticsInputDto,
  StartVerificationInputDto,
} from "@/modules/baekjoon/application/dtos"
import {
  CompleteVerificationRequestDto,
  GetProfileRequestDto,
  GetTagStatisticsRequestDto,
  StartVerificationRequestDto,
} from "@/modules/baekjoon/infrastructure/dtos/request"

@Injectable()
export class BaekjoonRequestMapper {
  toStartVerificationInput(request: StartVerificationRequestDto): StartVerificationInputDto {
    return {
      email: request.email,
      handle: request.handle,
    }
  }

  toCompleteVerificationInput(request: CompleteVerificationRequestDto): CompleteVerificationInputDto {
    return {
      email: request.email,
      handle: request.handle,
      sessionId: request.sessionId,
    }
  }

  toGetProfileInput(request: GetProfileRequestDto): GetProfileInputDto {
    return {
      userId: request.email,
      handle: request.handle,
    }
  }

  toGetStatisticsInput(request: GetTagStatisticsRequestDto): GetStatisticsInputDto {
    return {
      userId: request.email,
      handle: request.handle,
    }
  }
}
