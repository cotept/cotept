import { ApiProperty, ApiPropertyOptional, PartialType, PickType } from "@nestjs/swagger"

import { Expose, Transform } from "class-transformer"
import { IsNotEmpty, IsOptional, IsString, Length, Matches } from "class-validator"

/**
 * UserProfile 기본 DTO
 * 모든 UserProfile 관련 필드를 정의하는 기본 DTO
 * 다른 CRUD DTO들의 기반이 됨
 */
export class UserProfileDto {
  @ApiProperty({
    description: "프로필 ID (자동증가 기본키)",
    example: 1,
  })
  @Expose()
  idx: number

  @ApiProperty({
    description: "사용자 로그인 아이디 (6~20자, 영문/숫자/특수문자)",
    example: "dudtod1596",
  })
  @Expose()
  @IsString({ message: "사용자 아이디는 문자열이어야 합니다." })
  @IsNotEmpty({ message: "사용자 아이디는 필수 값입니다." })
  @Length(6, 20, { message: "사용자 아이디는 6자 이상 20자 이하여야 합니다." })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: "사용자 아이디는 영문, 숫자, _, - 만 사용 가능합니다." })
  userId: string

  @ApiProperty({
    description: "닉네임 (2~50자, 한글/영문만 허용)",
    example: "코딩마스터",
  })
  @Expose()
  @IsString({ message: "닉네임은 문자열이어야 합니다." })
  @IsNotEmpty({ message: "닉네임은 필수 값입니다." })
  @Transform(({ value }) => value?.trim())
  @Length(2, 50, { message: "닉네임은 2자 이상 50자 이하여야 합니다." })
  @Matches(/^[가-힣a-zA-Z]+$/, {
    message: "닉네임은 한글, 영문자만 허용됩니다. (특수문자, 숫자, 공백 제외)",
  })
  nickname: string

  @Expose()
  @IsOptional()
  @IsString({ message: "이름은 문자열이어야 합니다." })
  @Transform(({ value }) => value?.trim())
  @Length(2, 50, { message: "이름은 2자 이상 50자 이하여야 합니다." })
  @Matches(/^[가-힣a-zA-Z\s]+$/, { message: "이름은 한글과 영문자만 허용됩니다." })
  fullName?: string

  @ApiPropertyOptional({
    description: "자기소개 (280자 이하, 트위터 스타일)",
    example: "안녕하세요! 백엔드 개발을 공부하고 있는 멘티입니다. 열심히 배워보겠습니다!",
  })
  @Expose()
  @IsOptional()
  @IsString({ message: "자기소개는 문자열이어야 합니다." })
  @Transform(({ value }) => value?.trim())
  @Length(0, 280, { message: "자기소개는 280자 이하여야 합니다." })
  introduce?: string

  @ApiPropertyOptional({
    description: "프로필 이미지 URL",
    example: "https://example.com/profile/image.jpg",
  })
  @Expose()
  @IsOptional()
  @IsString({ message: "프로필 이미지 URL은 문자열이어야 합니다." })
  @Transform(({ value }) => value?.trim())
  @Length(1, 1000, { message: "프로필 이미지 URL은 1000자 이하여야 합니다." })
  profileImageUrl?: string

  @ApiProperty({
    description: "생성일시",
    example: "2024-01-15T10:30:00Z",
  })
  @Expose()
  createdAt: Date

  @ApiProperty({
    description: "수정일시",
    example: "2024-01-15T10:30:00Z",
  })
  @Expose()
  updatedAt: Date
}

/**
 * UserProfile 생성 요청 DTO
 * userId, nickname, fullName, introduce, profileImageUrl만 포함
 */
export class CreateUserProfileRequestDto extends PickType(UserProfileDto, [
  "userId",
  "nickname",
  "fullName",
  "introduce",
  "profileImageUrl",
] as const) {}

/**
 * UserProfile 업데이트 요청 DTO
 * nickname, fullName, introduce, profileImageUrl를 선택적으로 업데이트 가능
 */
export class UpdateUserProfileRequestDto extends PartialType(
  PickType(UserProfileDto, ["nickname", "fullName", "introduce", "profileImageUrl"] as const),
) {}

/**
 * UserProfile 응답 DTO
 * idx, createdAt, updatedAt 포함한 전체 프로필 정보
 */
export class UserProfileResponseDto extends UserProfileDto {}

/**
 * UserProfile 생성 성공 응답 DTO
 */
export class CreateUserProfileResponseDto {
  @ApiProperty({
    description: "생성된 사용자 프로필 정보",
    type: UserProfileResponseDto,
  })
  @Expose()
  profile: UserProfileResponseDto

  @ApiProperty({
    description: "성공 메시지",
    example: "사용자 프로필이 성공적으로 생성되었습니다.",
  })
  @Expose()
  message: string
}

/**
 * UserProfile 업데이트 성공 응답 DTO
 */
export class UpdateUserProfileResponseDto {
  @ApiProperty({
    description: "업데이트된 사용자 프로필 정보",
    type: UserProfileResponseDto,
  })
  @Expose()
  profile: UserProfileResponseDto

  @ApiProperty({
    description: "성공 메시지",
    example: "사용자 프로필이 성공적으로 업데이트되었습니다.",
  })
  @Expose()
  message: string
}

/**
 * UserProfile 조회 성공 응답 DTO
 */
export class GetUserProfileResponseDto {
  @ApiProperty({
    description: "사용자 프로필 정보",
    type: UserProfileResponseDto,
  })
  @Expose()
  profile: UserProfileResponseDto
}
