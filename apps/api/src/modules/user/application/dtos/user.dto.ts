import { IsNotSequential } from "@/shared/infrastructure/common/validators/is-not-sequential.validator"
import { ApiProperty } from "@nestjs/swagger"
import { Expose, Transform } from "class-transformer"
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Validate,
} from "class-validator"
import { UserRole, UserStatus } from '@/modules/user/domain/model/user'

/**
 * 사용자 정보 DTO
 * 모든 사용자 관련 필드를 정의하는 기본 DTO
 * 다른 CRUD DTO들의 기반이 됨
 */
export class UserDto {
  @ApiProperty({
    description: "사용자 고유 ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @Expose()
  @IsUUID("4", { message: "유효한 사용자 ID 형식이 아닙니다." })
  id: string

  @ApiProperty({
    description: "사용자 이메일",
    example: "user@example.com",
  })
  @Expose()
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEmail({}, { message: "유효한 이메일 형식이 아닙니다." })
  @IsNotEmpty({ message: "이메일은 필수 값입니다." })
  email: string

  @ApiProperty({
    description: "비밀번호 (8~32자, 대소문자, 숫자, 특수문자 포함)",
    example: "StrongP@ss123",
    required: false,
  })
  @Expose()
  @IsString({ message: "비밀번호는 문자열이어야 합니다." })
  @IsOptional()
  @Length(8, 32, { message: "비밀번호는 8자 이상 32자 이하여야 합니다." })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,32}$/, {
    message: "비밀번호는 최소 하나의 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.",
  })
  @Validate(IsNotSequential, { message: "비밀번호에 연속된 문자나 숫자(123, abc 등)를 사용할 수 없습니다." })
  password?: string

  @ApiProperty({
    description: "사용자 이름 (2~50자, 한글/영문만 허용)",
    example: "홍길동",
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsString({ message: "이름은 문자열이어야 합니다." })
  @Transform(({ value }) => value?.trim())
  @Length(2, 50, { message: "이름은 2자 이상 50자 이하여야 합니다." })
  @Matches(/^[가-힣a-zA-Z\s]+$/, { message: "이름은 한글과 영문자만 허용됩니다." })
  name?: string

  @ApiProperty({
    description: "사용자 역할",
    example: UserRole.MENTEE,
    enum: UserRole,
    enumName: 'UserRole',
  })
  @Expose()
  @IsEnum(UserRole, { message: "유효한 사용자 역할이 아닙니다." })
  role: UserRole

  @ApiProperty({
    description: "사용자 상태",
    example: UserStatus.ACTIVE,
    enum: UserStatus,
    enumName: 'UserStatus',
  })
  @Expose()
  @IsEnum(UserStatus, { message: "유효한 사용자 상태가 아닙니다." })
  status: UserStatus

  @ApiProperty({
    description: "전화번호 (- 없이 숫자만)",
    example: "01012345678",
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsString({ message: "전화번호는 문자열이어야 합니다." })
  @Transform(({ value }) => value?.replace(/[^0-9]/g, ""))
  @Matches(/^01[0-9]{8,9}$/, { message: "유효한 한국 휴대폰 번호 형식이 아닙니다." })
  phoneNumber?: string

  @ApiProperty({
    description: "전화번호 인증 여부",
    example: false,
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsBoolean({ message: "전화번호 인증 여부는 불리언 값이어야 합니다." })
  phoneVerified?: boolean

  @ApiProperty({
    description: "사용자 생성일",
    example: "2023-01-01T00:00:00Z",
  })
  @Expose()
  @IsDate({ message: "생성일은 유효한 날짜여야 합니다." })
  createdAt: Date

  @ApiProperty({
    description: "사용자 정보 수정일",
    example: "2023-01-01T00:00:00Z",
  })
  @Expose()
  @IsDate({ message: "수정일은 유효한 날짜여야 합니다." })
  updatedAt: Date

  @ApiProperty({
    description: "마지막 로그인 일시",
    example: "2023-01-01T00:00:00Z",
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsDate({ message: "마지막 로그인 일시는 유효한 날짜여야 합니다." })
  lastLoginAt?: Date
}
