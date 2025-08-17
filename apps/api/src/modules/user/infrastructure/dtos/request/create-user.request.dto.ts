import { ApiProperty } from '@nestjs/swagger';

import { Expose, Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

import { UserRole } from '@/modules/user/domain/model/user';

/**
 * 사용자 생성 요청 DTO
 */
export class CreateUserRequestDto {
  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
  })
  @Expose()
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEmail({}, { message: '유효한 이메일 형식이 아닙니다.' })
  @IsNotEmpty({ message: '이메일은 필수 값입니다.' })
  email: string;

  @ApiProperty({
    description: '비밀번호 (8~32자, 대소문자, 숫자, 특수문자 포함)',
    example: 'StrongP@ss123',
  })
  @Expose()
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '비밀번호는 필수 값입니다.' })
  @Length(8, 32, { message: '비밀번호는 8자 이상 32자 이하여야 합니다.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,32}$/, {
    message: '비밀번호는 최소 하나의 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.',
  })
  password: string;

  @ApiProperty({
    description: '사용자 이름 (2~50자, 한글/영문만 허용)',
    example: '홍길동',
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  @Transform(({ value }) => value?.trim())
  @Length(2, 50, { message: '이름은 2자 이상 50자 이하여야 합니다.' })
  @Matches(/^[가-힣a-zA-Z\s]+$/, { message: '이름은 한글과 영문자만 허용됩니다.' })
  name?: string;

  @ApiProperty({
    description: '전화번호 (- 없이 숫자만)',
    example: '01012345678',
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsString({ message: '전화번호는 문자열이어야 합니다.' })
  @Transform(({ value }) => value?.replace(/[^0-9]/g, ''))
  @Matches(/^01[0-9]{8,9}$/, { message: '유효한 한국 휴대폰 번호 형식이 아닙니다.' })
  phoneNumber?: string;

  @ApiProperty({
    description: '사용자 역할 (기본값: MENTEE)',
    example: UserRole.MENTEE,
    required: false,
    enum: UserRole,
    enumName: 'UserRole',
  })
  @Expose()
  @IsOptional()
  @IsEnum(UserRole, { message: '유효한 사용자 역할이 아닙니다.' })
  role?: UserRole = UserRole.MENTEE;
}