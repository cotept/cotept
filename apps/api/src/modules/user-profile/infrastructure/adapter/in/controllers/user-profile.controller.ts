import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger"

import { JwtAuthGuard } from "@/modules/auth/infrastructure/common/guards/jwt-auth.guards"
import { UserProfileDto } from "@/modules/user-profile/application/dtos/user-profile.dto"
import { UserProfileFacadeService } from "@/modules/user-profile/application/services/facade/user-profile-facade.service"
import {
  CreateUserProfileRequestDto,
  UpdateUserProfileRequestDto,
} from "@/modules/user-profile/infrastructure/adapter/in/dto/request"
import {
  BasicProfileCreationResponseDto,
  MyProfileResponseDto,
  UserProfileCompletenessResponseDto,
  UserProfileCreationResponseDto,
  UserProfileDeletionResponseDto,
  UserProfileUpdateResponseDto,
  UserProfileUpsertResponseDto,
} from "@/modules/user-profile/infrastructure/adapter/in/dto/response"
import { UserProfileRequestMapper } from "@/modules/user-profile/infrastructure/adapter/in/mappers/user-profile-request.mapper"
import { ApiOkResponseWrapper } from "@/shared/infrastructure/decorators/api-response.decorator"
import {
  ApiAuthRequiredErrors,
  ApiStandardErrors,
} from "@/shared/infrastructure/decorators/common-error-responses.decorator"
import { CurrentUserId } from "@/shared/infrastructure/decorators/current-user.decorator"

@ApiTags("UserProfile")
@Controller("user-profiles")
export class UserProfileController {
  constructor(
    private readonly userProfileFacadeService: UserProfileFacadeService,
    private readonly requestMapper: UserProfileRequestMapper,
  ) {}

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "내 프로필 정보 조회",
    description: "현재 로그인한 사용자의 멘티 프로필과 멘토 프로필 보유 여부를 조회합니다.",
    operationId: "getMyProfile",
  })
  @ApiOkResponseWrapper(MyProfileResponseDto, "성공적으로 내 프로필 정보를 조회함")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  @ApiNotFoundResponse({ description: "프로필을 찾을 수 없습니다" })
  async getMyProfile(@CurrentUserId() userId: string): Promise<MyProfileResponseDto> {
    return await this.userProfileFacadeService.getMyProfile(userId)
  }

  @Get(":userId")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "사용자 프로필 조회",
    description: "사용자 ID로 프로필 정보를 조회합니다.",
    operationId: "getUserProfile",
  })
  @ApiParam({ name: "userId", description: "사용자 ID", example: "dudtod1596" })
  @ApiOkResponseWrapper(UserProfileDto, "성공적으로 사용자 프로필을 조회함")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  @ApiForbiddenResponse({ description: "해당 프로필에 접근할 권한이 없습니다" })
  @ApiNotFoundResponse({ description: "요청하신 사용자 프로필을 찾을 수 없습니다" })
  async getProfileByUserId(@Param("userId") userId: string): Promise<UserProfileDto> {
    return this.userProfileFacadeService.getProfileByUserIdOrThrow(userId)
  }

  @Get("idx/:idx")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "프로필 ID로 조회",
    description: "프로필 고유 ID로 프로필 정보를 조회합니다.",
    operationId: "getUserProfileByIdx",
  })
  @ApiParam({ name: "idx", description: "프로필 고유 ID", type: "number" })
  @ApiOkResponseWrapper(UserProfileDto, "성공적으로 사용자 프로필을 조회함")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  @ApiForbiddenResponse({ description: "해당 프로필에 접근할 권한이 없습니다" })
  @ApiNotFoundResponse({ description: "요청하신 사용자 프로필을 찾을 수 없습니다" })
  async getProfileByIdx(@Param("idx") idx: number): Promise<UserProfileDto> {
    return this.userProfileFacadeService.getProfileByIdxOrThrow(idx)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "사용자 프로필 생성",
    description: "새로운 사용자 프로필을 생성합니다.",
    operationId: "createUserProfile",
  })
  @ApiOkResponseWrapper(UserProfileCreationResponseDto, "성공적으로 사용자 프로필을 생성함")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  @ApiBadRequestResponse({ description: "잘못된 요청 데이터입니다" })
  @ApiNotFoundResponse({ description: "해당 사용자를 찾을 수 없습니다" })
  @ApiConflictResponse({ description: "이미 프로필이 존재하거나 닉네임이 중복됩니다" })
  async createProfile(@Body() createDto: CreateUserProfileRequestDto): Promise<UserProfileCreationResponseDto> {
    const applicationDto = this.requestMapper.toCreateApplicationDto(createDto)
    const profile = await this.userProfileFacadeService.createProfile(applicationDto)
    return new UserProfileCreationResponseDto(profile)
  }

  @Put(":userId")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "사용자 프로필 수정",
    description: "사용자 프로필 정보를 수정합니다.",
    operationId: "updateUserProfile",
  })
  @ApiParam({ name: "userId", description: "사용자 ID", example: "dudtod1596" })
  @ApiOkResponseWrapper(UserProfileUpdateResponseDto, "성공적으로 사용자 프로필을 수정함")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  @ApiBadRequestResponse({ description: "잘못된 요청 데이터입니다" })
  @ApiNotFoundResponse({ description: "해당 사용자 프로필을 찾을 수 없습니다" })
  @ApiConflictResponse({ description: "닉네임이 이미 사용 중입니다" })
  @ApiForbiddenResponse({ description: "다른 사용자의 프로필은 수정할 수 없습니다" })
  async updateProfile(
    @Param("userId") userId: string,
    @Body() updateDto: UpdateUserProfileRequestDto,
  ): Promise<UserProfileUpdateResponseDto> {
    const applicationDto = this.requestMapper.toUpdateApplicationDto(updateDto)
    const profile = await this.userProfileFacadeService.updateProfile(userId, applicationDto)

    // 업데이트된 필드 목록 계산 (null이 아닌 필드들)
    const updatedFields = Object.keys(updateDto).filter(
      (key) => updateDto[key] !== undefined && updateDto[key] !== null,
    )

    return new UserProfileUpdateResponseDto(profile, updatedFields)
  }

  @Delete(":userId")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "사용자 프로필 삭제",
    description: "사용자 프로필을 삭제합니다.",
    operationId: "deleteUserProfile",
  })
  @ApiParam({ name: "userId", description: "사용자 ID", example: "dudtod1596" })
  @ApiOkResponseWrapper(UserProfileDeletionResponseDto, "성공적으로 사용자 프로필을 삭제함")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  @ApiNotFoundResponse({ description: "해당 사용자 프로필을 찾을 수 없습니다" })
  @ApiForbiddenResponse({ description: "다른 사용자의 프로필은 삭제할 수 없습니다" })
  async deleteProfile(@Param("userId") userId: string): Promise<UserProfileDeletionResponseDto> {
    const success = await this.userProfileFacadeService.deleteProfile(userId)
    return new UserProfileDeletionResponseDto(success, userId)
  }

  @Get(":userId/completeness")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "프로필 완성도 확인",
    description: "사용자 프로필의 완성도를 확인하고 누락된 필드를 반환합니다.",
    operationId: "checkProfileCompleteness",
  })
  @ApiParam({ name: "userId", description: "사용자 ID", example: "dudtod1596" })
  @ApiOkResponseWrapper(UserProfileCompletenessResponseDto, "성공적으로 프로필 완성도를 확인함")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  @ApiForbiddenResponse({ description: "해당 프로필에 접근할 권한이 없습니다" })
  async checkProfileCompleteness(@Param("userId") userId: string): Promise<UserProfileCompletenessResponseDto> {
    const completeness = await this.userProfileFacadeService.checkProfileCompleteness(userId)
    return new UserProfileCompletenessResponseDto(completeness)
  }

  @Put(":userId/upsert")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "프로필 생성 또는 수정",
    description: "프로필이 존재하면 수정하고, 존재하지 않으면 생성합니다.",
    operationId: "upsertUserProfile",
  })
  @ApiParam({ name: "userId", description: "사용자 ID", example: "dudtod1596" })
  @ApiOkResponseWrapper(UserProfileUpsertResponseDto, "성공적으로 프로필을 생성 또는 수정함")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  @ApiBadRequestResponse({ description: "잘못된 요청 데이터입니다" })
  @ApiNotFoundResponse({ description: "해당 사용자를 찾을 수 없습니다" })
  @ApiConflictResponse({ description: "닉네임이 이미 사용 중입니다" })
  @ApiForbiddenResponse({ description: "다른 사용자의 프로필은 수정할 수 없습니다" })
  async upsertProfile(
    @Param("userId") userId: string,
    @Body()
    profileData: {
      nickname: string
      fullName?: string
      introduce?: string
      profileImageUrl?: string
    },
  ): Promise<UserProfileUpsertResponseDto> {
    const result = await this.userProfileFacadeService.upsertProfile(userId, profileData)
    return new UserProfileUpsertResponseDto(result)
  }

  @Post("signup/:userId")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "회원가입 시 기본 프로필 생성",
    description: "회원가입 시 최소한의 정보로 기본 프로필을 생성하고 완성도 가이드를 제공합니다.",
    operationId: "createBasicProfileForSignup",
  })
  @ApiParam({ name: "userId", description: "사용자 ID", example: "dudtod1596" })
  @ApiOkResponseWrapper(BasicProfileCreationResponseDto, "성공적으로 기본 프로필을 생성함")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  @ApiBadRequestResponse({ description: "잘못된 요청 데이터입니다" })
  @ApiNotFoundResponse({ description: "해당 사용자를 찾을 수 없습니다" })
  @ApiConflictResponse({ description: "이미 프로필이 존재하거나 닉네임이 중복됩니다" })
  async createBasicProfileForSignup(
    @Param("userId") userId: string,
    @Body() basicData: { nickname: string; introduce?: string },
  ): Promise<BasicProfileCreationResponseDto> {
    const result = await this.userProfileFacadeService.createBasicProfileForSignup(
      userId,
      basicData.nickname,
      basicData.introduce,
    )
    return new BasicProfileCreationResponseDto(result)
  }
}
