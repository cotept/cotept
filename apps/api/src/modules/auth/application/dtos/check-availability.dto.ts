import { Expose } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator'

/**
 * 이메일 중복 확인 DTO
 */
export class CheckEmailAvailabilityDto {
  @Expose()
  @IsEmail({}, { message: '유효한 이메일 형식이어야 합니다.' })
  @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다.' })
  email: string
}

/**
 * 사용자 ID 중복 확인 DTO
 */
export class CheckUserIdAvailabilityDto {
  @Expose()
  @IsString({ message: '아이디는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '아이디는 필수 입력 항목입니다.' })
  @Length(4, 20, { message: '아이디는 4-20자 사이여야 합니다.' })
  userId: string
}

/**
 * 닉네임 중복 확인 DTO
 */
export class CheckNicknameAvailabilityDto {
  @Expose()
  @IsString({ message: '닉네임은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '닉네임은 필수 입력 항목입니다.' })
  @Length(2, 20, { message: '닉네임은 2-20자 사이여야 합니다.' })
  nickname: string
}

/**
 * 중복 확인 결과 DTO
 */
export class AvailabilityResultDto {
  @Expose()
  available: boolean
}