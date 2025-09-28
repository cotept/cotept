import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common"
import { ApiConflictResponse, ApiNotFoundResponse, ApiOperation, ApiTags } from "@nestjs/swagger"

import { JwtAuthGuard } from "@/modules/auth/infrastructure/common/guards"
import { TagStatisticsOutputDto } from "@/modules/baekjoon/application/dtos"
import {
  TagStatisticsResponseDto,
  VerificationResultResponseDto,
  VerificationStatusResponseDto,
} from "@/modules/baekjoon/infrastructure/dtos/response"
import { MentorProfileDto } from "@/modules/mentor/application/dtos/mentor-profile.dto"
import { MentorTagsResponseDto } from "@/modules/mentor/application/dtos/mentor-tags.dto"
import { AnalyzeSkillsDto } from "@/modules/onboarding/application/dtos/analyze-skills.dto"
import { CheckMentorEligibilityDto } from "@/modules/onboarding/application/dtos/check-mentor-eligibility.dto"
import { CompleteBaekjoonVerificationDto } from "@/modules/onboarding/application/dtos/complete-baekjoon-verification.dto"
import { CompleteOnboardingDto } from "@/modules/onboarding/application/dtos/complete-onboarding.dto"
import { CreateBasicProfileDto } from "@/modules/onboarding/application/dtos/create-basic-profile.dto"
import { CreateMentorProfileDto } from "@/modules/onboarding/application/dtos/create-mentor-profile.dto"
import { MentorEligibilityDto } from "@/modules/onboarding/application/dtos/mentor-eligibility.dto"
import { StartBaekjoonVerificationDto } from "@/modules/onboarding/application/dtos/start-baekjoon-verification.dto"
import { OnboardingFacadeService } from "@/modules/onboarding/application/services/facade/onboarding-facade.service"
import { UserProfileDto } from "@/modules/user-profile/application/dtos"
import {
  ApiAuthRequiredErrors,
  ApiExternalServiceErrors,
  ApiOkResponseWrapper,
  ApiStandardErrors,
} from "@/shared/infrastructure/decorators"
import { CurrentUserId } from "@/shared/infrastructure/decorators/current-user.decorator"

@ApiTags("Onboarding")
@Controller("onboarding")
export class OnboardingController {
  constructor(private readonly facadeService: OnboardingFacadeService) {}

  @Post("profile")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "온보딩 - 기본 프로필 생성" })
  @ApiOkResponseWrapper(UserProfileDto, "기본 프로필이 성공적으로 생성되었습니다.")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  @ApiConflictResponse({ description: "닉네임이 중복되거나 이미 프로필이 존재합니다." })
  async createBasicProfile(
    @CurrentUserId() userId: string,
    @Body() dto: CreateBasicProfileDto,
  ): Promise<UserProfileDto> {
    dto.userId = userId // userId 주입
    return this.facadeService.createBasicProfile(dto)
  }

  @Post("baekjoon/verify/start")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "온보딩 - 백준 인증 시작" })
  @ApiOkResponseWrapper(VerificationStatusResponseDto, "백준 인증 세션이 성공적으로 시작되었습니다.")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  @ApiNotFoundResponse({ description: "백준 사용자를 찾을 수 없습니다." })
  @ApiConflictResponse({ description: "이미 진행 중인 인증이 있거나, 다른 사용자가 사용중인 핸들입니다." })
  @ApiExternalServiceErrors()
  async startBaekjoonVerification(
    @CurrentUserId() userId: string,
    @Body() dto: StartBaekjoonVerificationDto,
  ): Promise<VerificationStatusResponseDto> {
    dto.userId = userId // userId 주입
    return this.facadeService.startBaekjoonVerification(dto)
  }

  @Post("baekjoon/verify/complete")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "온보딩 - 백준 인증 완료" })
  @ApiOkResponseWrapper(VerificationResultResponseDto, "백준 인증이 성공적으로 완료되었습니다.")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  @ApiNotFoundResponse({ description: "진행 중인 인증 세션을 찾을 수 없습니다." })
  @ApiExternalServiceErrors()
  async completeBaekjoonVerification(
    @CurrentUserId() userId: string,
    @Body() dto: CompleteBaekjoonVerificationDto,
  ): Promise<VerificationResultResponseDto> {
    dto.userId = userId // userId 주입
    return this.facadeService.completeBaekjoonVerification(dto)
  }

  @Post("analyze")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "온보딩 - 실력 분석 실행" })
  @ApiOkResponseWrapper(TagStatisticsOutputDto, "실력 분석이 성공적으로 완료되었습니다.")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  @ApiNotFoundResponse({ description: "백준 프로필을 찾을 수 없습니다." })
  @ApiExternalServiceErrors()
  async analyzeSkills(@CurrentUserId() userId: string): Promise<TagStatisticsResponseDto> {
    const dto: AnalyzeSkillsDto = { userId } // userId를 포함하는 DTO 생성
    return this.facadeService.analyzeSkills(dto)
  }

  @Get("mentor/eligibility")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "온보딩 - 멘토 자격 요건 확인" })
  @ApiOkResponseWrapper(MentorEligibilityDto, "멘토 자격 요건을 성공적으로 확인했습니다.")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  @ApiNotFoundResponse({ description: "백준 프로필을 찾을 수 없습니다." })
  async checkMentorEligibility(@CurrentUserId() userId: string): Promise<MentorEligibilityDto> {
    const dto: CheckMentorEligibilityDto = { userId } // userId를 포함하는 DTO 생성
    return this.facadeService.checkMentorEligibility(dto)
  }

  @Get("mentor/tags")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "온보딩 - 멘토 프로필 태그 목록 조회" })
  @ApiOkResponseWrapper(MentorTagsResponseDto, "멘토 태그 목록을 성공적으로 조회했습니다.")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  async getMentorTags(): Promise<MentorTagsResponseDto> {
    return this.facadeService.getMentorTags()
  }

  @Post("mentor-profile")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "온보딩 - 멘토 프로필 생성/업데이트",
    operationId: "createMentorProfileOnboarding"
  })
  @ApiOkResponseWrapper(MentorProfileDto, "멘토 프로필이 성공적으로 생성/업데이트되었습니다.")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  @ApiNotFoundResponse({ description: "사용자를 찾을 수 없습니다." })
  @ApiConflictResponse({ description: "멘토 프로필이 이미 존재합니다." })
  async createMentorProfile(
    @CurrentUserId() userId: string,
    @Body() dto: CreateMentorProfileDto,
  ): Promise<MentorProfileDto> {
    dto.userId = userId // userId 주입
    return this.facadeService.createMentorProfile(dto)
  }

  @Post("complete")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "온보딩 - 온보딩 완료" })
  @ApiOkResponseWrapper(Boolean, "온보딩이 성공적으로 완료되었습니다.")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  @ApiNotFoundResponse({ description: "온보딩 상태를 찾을 수 없습니다." })
  @ApiConflictResponse({ description: "온보딩이 아직 완료되지 않았습니다." })
  async completeOnboarding(@CurrentUserId() userId: string): Promise<boolean> {
    const dto: CompleteOnboardingDto = { userId } // userId를 포함하는 DTO 생성
    return this.facadeService.completeOnboarding(dto)
  }
}
