import { BaekjoonFacadeService } from "@/modules/baekjoon/application/services/facade/baekjoon-facade.service"
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import { BaekjoonRequestMapper } from "../mappers/baekjoon-request.mapper"
import { 
  CompleteVerificationRequestDto, 
  GetProfileRequestDto, 
  StartVerificationRequestDto 
} from "../../dtos/request"
import { 
  BaekjoonProfileResponseDto, 
  TagStatisticsResponseDto, 
  VerificationResultResponseDto, 
  VerificationStatusResponseDto 
} from "../../dtos/response"

@ApiTags("백준 인증 및 프로필")
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
    description: "백준 ID 인증 프로세스를 시작하고 인증 문자열을 발급받습니다." 
  })
  @ApiCreatedResponse({ 
    description: "인증 세션이 성공적으로 생성됨", 
    type: VerificationStatusResponseDto 
  })
  @ApiBadRequestResponse({ description: "잘못된 요청 데이터" })
  @ApiUnauthorizedResponse({ description: "인증이 필요함" })
  @ApiNotFoundResponse({ description: "백준 사용자를 찾을 수 없음" })
  @ApiConflictResponse({ description: "이미 진행 중인 인증 세션이 있음" })
  @ApiTooManyRequestsResponse({ description: "API 호출 한도 초과" })
  async startVerification(
    @Body() request: StartVerificationRequestDto,
    // @CurrentUser() user: UserContext, // TODO: 인증 가드 구현 후 추가
  ): Promise<VerificationStatusResponseDto> {
    // 임시로 하드코딩된 사용자 ID 사용 (인증 시스템 구현 후 수정)
    const userId = "temp-user-id"
    
    const dto = this.requestMapper.toStartVerificationDto(request, userId)
    return this.baekjoonFacadeService.startVerification(dto)
  }

  @Post("verification/complete")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: "백준 ID 인증 완료", 
    description: "solved.ac 프로필 이름을 확인하여 백준 ID 인증을 완료합니다." 
  })
  @ApiOkResponse({ 
    description: "인증이 성공적으로 완료됨", 
    type: VerificationResultResponseDto 
  })
  @ApiBadRequestResponse({ description: "잘못된 요청 데이터 또는 인증 문자열 불일치" })
  @ApiUnauthorizedResponse({ description: "인증이 필요함" })
  @ApiNotFoundResponse({ description: "인증 세션을 찾을 수 없음" })
  @ApiTooManyRequestsResponse({ description: "인증 시도 한도 초과" })
  async completeVerification(
    @Body() request: CompleteVerificationRequestDto,
    // @CurrentUser() user: UserContext, // TODO: 인증 가드 구현 후 추가
  ): Promise<VerificationResultResponseDto> {
    // 임시로 하드코딩된 사용자 ID 사용
    const userId = "temp-user-id"
    
    const dto = this.requestMapper.toCompleteVerificationDto(request, userId)
    return this.baekjoonFacadeService.completeVerification(dto)
  }

  @Get("verification/status/:sessionId")
  @ApiOperation({ 
    summary: "인증 상태 조회", 
    description: "진행 중인 인증 세션의 상태를 조회합니다." 
  })
  @ApiParam({ 
    name: "sessionId", 
    description: "인증 세션 ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @ApiOkResponse({ 
    description: "인증 상태 조회 성공", 
    type: VerificationStatusResponseDto 
  })
  @ApiUnauthorizedResponse({ description: "인증이 필요함" })
  @ApiNotFoundResponse({ description: "인증 세션을 찾을 수 없음" })
  async getVerificationStatus(
    @Param("sessionId") sessionId: string,
    // @CurrentUser() user: UserContext, // TODO: 인증 가드 구현 후 추가
  ): Promise<VerificationStatusResponseDto> {
    // 임시로 하드코딩된 사용자 ID 사용
    const userId = "temp-user-id"
    
    return this.baekjoonFacadeService.getVerificationStatus(userId, sessionId)
  }

  @Get("profile")
  @ApiOperation({ 
    summary: "백준 프로필 조회", 
    description: "사용자의 백준 프로필 정보를 조회합니다. handle을 제공하지 않으면 현재 사용자의 프로필을 조회합니다." 
  })
  @ApiQuery({ 
    name: "handle", 
    required: false, 
    description: "백준 ID (제공하지 않으면 현재 사용자 프로필 조회)",
    example: "solved_user123"
  })
  @ApiOkResponse({ 
    description: "프로필 조회 성공", 
    type: BaekjoonProfileResponseDto 
  })
  @ApiUnauthorizedResponse({ description: "인증이 필요함" })
  @ApiNotFoundResponse({ description: "백준 프로필을 찾을 수 없음" })
  async getProfile(
    @Query() query: GetProfileRequestDto,
    // @CurrentUser() user: UserContext, // TODO: 인증 가드 구현 후 추가
  ): Promise<BaekjoonProfileResponseDto> {
    // 임시로 하드코딩된 사용자 ID 사용
    const userId = "temp-user-id"
    
    const { userId: targetUserId, handle } = this.requestMapper.toGetProfileParams(query.handle, userId)
    return this.baekjoonFacadeService.getProfile(targetUserId, handle)
  }

  @Get("statistics")
  @ApiOperation({ 
    summary: "백준 태그 통계 조회", 
    description: "사용자의 백준 태그별 문제 해결 통계를 조회합니다." 
  })
  @ApiQuery({ 
    name: "handle", 
    required: false, 
    description: "백준 ID (제공하지 않으면 현재 사용자 통계 조회)",
    example: "solved_user123"
  })
  @ApiOkResponse({ 
    description: "태그 통계 조회 성공", 
    type: TagStatisticsResponseDto 
  })
  @ApiUnauthorizedResponse({ description: "인증이 필요함" })
  @ApiNotFoundResponse({ description: "태그 통계를 찾을 수 없음" })
  async getStatistics(
    @Query() query: GetProfileRequestDto,
    // @CurrentUser() user: UserContext, // TODO: 인증 가드 구현 후 추가
  ): Promise<TagStatisticsResponseDto> {
    // 임시로 하드코딩된 사용자 ID 사용
    const userId = "temp-user-id"
    
    const { userId: targetUserId, handle } = this.requestMapper.toGetStatisticsParams(query.handle, userId)
    return this.baekjoonFacadeService.getStatistics(targetUserId, handle)
  }

  @Get("profile/:handle")
  @ApiOperation({ 
    summary: "특정 사용자 백준 프로필 조회", 
    description: "백준 ID로 특정 사용자의 프로필 정보를 조회합니다." 
  })
  @ApiParam({ 
    name: "handle", 
    description: "백준 ID",
    example: "solved_user123"
  })
  @ApiOkResponse({ 
    description: "프로필 조회 성공", 
    type: BaekjoonProfileResponseDto 
  })
  @ApiNotFoundResponse({ description: "백준 프로필을 찾을 수 없음" })
  async getProfileByHandle(
    @Param("handle") handle: string,
  ): Promise<BaekjoonProfileResponseDto> {
    // 공개 조회이므로 사용자 ID 없이 호출
    return this.baekjoonFacadeService.getProfileByHandle(handle)
  }

  @Get("statistics/:handle")
  @ApiOperation({ 
    summary: "특정 사용자 백준 태그 통계 조회", 
    description: "백준 ID로 특정 사용자의 태그별 문제 해결 통계를 조회합니다." 
  })
  @ApiParam({ 
    name: "handle", 
    description: "백준 ID",
    example: "solved_user123"
  })
  @ApiOkResponse({ 
    description: "태그 통계 조회 성공", 
    type: TagStatisticsResponseDto 
  })
  @ApiNotFoundResponse({ description: "태그 통계를 찾을 수 없음" })
  async getStatisticsByHandle(
    @Param("handle") handle: string,
  ): Promise<TagStatisticsResponseDto> {
    // 공개 조회이므로 사용자 ID 없이 호출
    return this.baekjoonFacadeService.getStatisticsByHandle(handle)
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
