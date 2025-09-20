import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put } from "@nestjs/common"
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger"

import { CreateMentorProfileDto } from "@/modules/mentor/application/dtos/create-mentor-profile.dto"
import { DeletionResponseDto } from "@/modules/mentor/application/dtos/deletion-response.dto"
import { MentorProfileDto } from "@/modules/mentor/application/dtos/mentor-profile.dto"
import { UpdateMentorProfileDto } from "@/modules/mentor/application/dtos/update-mentor-profile.dto"
import { MentorFacadeService } from "@/modules/mentor/application/services/facade/mentor-facade.service"

@ApiTags("멘토 프로필")
@Controller("mentor/profile")
export class MentorProfileController {
  constructor(private readonly mentorFacadeService: MentorFacadeService) {}

  @Post()
  @ApiOperation({ summary: "새 멘토 프로필 생성" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "멘토 프로필 생성 성공",
    type: MentorProfileDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "잘못된 요청 데이터" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "사용자 또는 태그를 찾을 수 없음" })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: "이미 멘토 프로필이 존재함" })
  async createMentorProfile(@Body() dto: CreateMentorProfileDto): Promise<MentorProfileDto> {
    return this.mentorFacadeService.createMentorProfile(dto)
  }

  @Put(":idx")
  @ApiOperation({ summary: "멘토 프로필 정보 수정 (PUT)" })
  @ApiParam({ name: "idx", type: "number", description: "멘토 프로필 IDX" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "멘토 프로필 수정 성공",
    type: MentorProfileDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "잘못된 요청 데이터" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "프로필 또는 태그를 찾을 수 없음" })
  async updateMentorProfile(
    @Param("idx") idx: number,
    @Body() dto: UpdateMentorProfileDto,
  ): Promise<MentorProfileDto> {
    return this.mentorFacadeService.updateMentorProfile(idx, dto)
  }

  @Delete(":idx")
  @ApiOperation({ summary: "멘토 프로필 비활성화 (논리적 삭제)" })
  @ApiParam({ name: "idx", type: "number", description: "멘토 프로필 IDX" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "멘토 프로필 비활성화 성공",
    type: DeletionResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "프로필을 찾을 수 없음" })
  async deleteMentorProfile(@Param("idx") idx: number): Promise<DeletionResponseDto> {
    return this.mentorFacadeService.deleteMentorProfile(idx)
  }

  @Delete(":idx/permanent")
  @ApiOperation({ summary: "멘토 프로필 영구 삭제 (물리적 삭제)" })
  @ApiParam({ name: "idx", type: "number", description: "멘토 프로필 IDX" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "멘토 프로필 영구 삭제 성공",
    type: DeletionResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "프로필을 찾을 수 없음" })
  async hardDeleteMentorProfile(@Param("idx") idx: number): Promise<DeletionResponseDto> {
    return this.mentorFacadeService.hardDeleteMentorProfile(idx)
  }

  @Get(":userId")
  @ApiOperation({
    summary: "사용자 ID로 멘토 프로필 조회",
    description: "특정 사용자의 멘토 프로필 정보를 조회합니다.",
  })
  @ApiParam({
    name: "userId",
    type: "string",
    description: "조회할 사용자의 ID",
    example: "user-12345",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "멘토 프로필 조회 성공",
    type: MentorProfileDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "멘토 프로필을 찾을 수 없음",
    schema: {
      example: {
        statusCode: 404,
        message: "User ID user-12345에 해당하는 멘토 프로필을 찾을 수 없습니다.",
        error: "Not Found",
      },
    },
  })
  async getMentorProfile(@Param("userId") userId: string): Promise<MentorProfileDto> {
    return this.mentorFacadeService.getMentorProfileByUserId(userId)
  }
}
