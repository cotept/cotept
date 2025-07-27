import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiRequestTimeoutResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import { ApiStandardErrors, ApiAuthRequiredErrors, ApiExternalServiceErrors } from "@/shared/infrastructure/decorators/common-error-responses.decorator"

import { JwtAuthGuard } from "@/modules/auth/infrastructure/common/guards"
import { BaekjoonFacadeService } from "@/modules/baekjoon/application/services/facade/baekjoon-facade.service"
import { BaekjoonRequestMapper } from "@/modules/baekjoon/infrastructure/adapter/in/mappers/baekjoon-request.mapper"
import {
  CompleteVerificationRequestDto,
  GetProfileRequestDto,
  GetTagStatisticsRequestDto,
  StartVerificationRequestDto,
} from "@/modules/baekjoon/infrastructure/dtos/request"
import {
  BaekjoonProfileResponseDto,
  TagStatisticsResponseDto,
  VerificationResultResponseDto,
  VerificationStatusResponseDto,
} from "@/modules/baekjoon/infrastructure/dtos/response"
import { ApiOkResponseWrapper } from "@/shared/infrastructure/decorators/api-response.decorator"

@ApiTags("Baekjoon")
@Controller("baekjoon")
export class BaekjoonController {
  constructor(
    private readonly baekjoonFacadeService: BaekjoonFacadeService,
    private readonly requestMapper: BaekjoonRequestMapper,
  ) {}

  @Post("verification/start")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "백준 ID 인증 시작",
    description: "백준 ID 인증 프로세스를 시작하고 인증 문자열을 발급받습니다.",
  })
  @ApiOkResponseWrapper(VerificationStatusResponseDto, "인증 세션이 성공적으로 생성됨")
  @ApiStandardErrors()
  @ApiNotFoundResponse({ description: "백준 사용자를 찾을 수 없습니다" })
  @ApiConflictResponse({ description: "이미 진행 중인 인증 세션이 있습니다" })
  @ApiExternalServiceErrors()
  async startVerification(
    @Body() request: StartVerificationRequestDto,
    // @CurrentUser() user: UserContext, // TODO: 인증 가드 구현 후 추가
  ): Promise<VerificationStatusResponseDto> {
    const inputDto = this.requestMapper.toStartVerificationInput(request)
    return this.baekjoonFacadeService.startVerification(inputDto)
  }

  @Post("verification/complete")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "백준 ID 인증 완료",
    description: "solved.ac 프로필 이름을 확인하여 백준 ID 인증을 완료합니다.",
  })
  @ApiOkResponseWrapper(VerificationResultResponseDto, "인증이 성공적으로 완료됨")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  @ApiNotFoundResponse({ description: "인증 세션을 찾을 수 없습니다" })
  @ApiExternalServiceErrors()
  async completeVerification(
    @Body() request: CompleteVerificationRequestDto,
    // @CurrentUser() user: UserContext, // TODO: 인증 가드 구현 후 추가
  ): Promise<VerificationResultResponseDto> {
    const inputDto = this.requestMapper.toCompleteVerificationInput(request)
    return this.baekjoonFacadeService.completeVerification(inputDto)
  }

  @Get("verification/status/:userId")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "인증 상태 조회",
    description: "진행 중인 인증 세션의 상태를 조회합니다.",
  })
  @ApiParam({
    name: "userId",
    description: "사용자 ID (이메일 형식)",
    example: "user@example.com",
  })
  @ApiOkResponseWrapper(VerificationStatusResponseDto, "인증 상태 조회 성공")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  @ApiNotFoundResponse({ description: "인증 세션을 찾을 수 없습니다" })
  async getVerificationStatus(
    @Param("userId") userId: string,
    // @CurrentUser() user: UserContext, // TODO: 인증 가드 구현 후 추가
  ): Promise<VerificationStatusResponseDto> {
    return this.baekjoonFacadeService.getVerificationStatus(userId)
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "백준 프로필 조회",
    description: "사용자의 백준 프로필 정보를 조회합니다. handle을 제공하지 않으면 현재 사용자의 프로필을 조회합니다.",
  })
  @ApiQuery({
    name: "handle",
    required: true,
    description: "백준 ID",
    example: "solved_user123",
  })
  @ApiOkResponseWrapper(BaekjoonProfileResponseDto, "프로필 조회 성공")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  @ApiNotFoundResponse({ description: "백준 프로필을 찾을 수 없습니다" })
  @ApiExternalServiceErrors()
  async getProfile(
    @Query() query: GetProfileRequestDto,
    // @CurrentUser() user: UserContext, // TODO: 인증 가드 구현 후 추가
  ): Promise<BaekjoonProfileResponseDto> {
    const inputDto = this.requestMapper.toGetProfileInput(query)
    return this.baekjoonFacadeService.getProfile(inputDto)
  }

  @Get("statistics")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "백준 태그 통계 조회",
    description: "사용자의 백준 태그별 문제 해결 통계를 조회합니다.",
  })
  @ApiQuery({
    name: "handle",
    required: true,
    description: "백준 ID",
    example: "solved_user123",
  })
  @ApiOkResponseWrapper(TagStatisticsResponseDto, "태그 통계 조회 성공")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  @ApiNotFoundResponse({ description: "태그 통계를 찾을 수 없습니다" })
  @ApiExternalServiceErrors()
  async getStatistics(@Query() query: GetTagStatisticsRequestDto): Promise<TagStatisticsResponseDto> {
    const inputDto = this.requestMapper.toGetStatisticsInput(query)
    return this.baekjoonFacadeService.getStatistics(inputDto)
  }

  // TODO: 관리자용 엔드포인트들 (추후 구현)

  // @Post("admin/cleanup-expired")
  // @UseGuards(JwtAuthGuard, RoleGuard)
  // @Roles(UserRole.ADMIN)
  // @ApiOperation({
  //   summary: "만료된 인증 세션 정리",
  //   description: "관리자가 만료된 인증 세션들을 수동으로 정리합니다."
  // })
  // async cleanupExpiredSessions(): Promise<{ deletedCount: number }> {
  //   const deletedCount = await this.baekjoonFacadeService.cleanupExpiredSessions()
  //   return { deletedCount }
  // }

  // @Get("admin/rate-limit/:userId")
  // @UseGuards(JwtAuthGuard, RoleGuard)
  // @Roles(UserRole.ADMIN)
  // @ApiOperation({
  //   summary: "사용자 Rate Limit 상태 조회",
  //   description: "관리자가 특정 사용자의 API 호출 제한 상태를 조회합니다."
  // })
  // async getUserRateLimitStatus(
  //   @Param("userId") userId: string,
  // ): Promise<any> {
  //   return this.baekjoonFacadeService.getUserRateLimitStatus(userId)
  // }
}
