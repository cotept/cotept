import { Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';

/**
 * 인증 코드 검증 DTO
 */
export class ValidateAuthCodeDto {
  @Expose()
  @IsString({ message: '인증 코드는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '인증 코드는 필수 입력 항목입니다.' })
  @Length(6, 6, { message: '인증 코드는 6자리여야 합니다.' })
  code: string;
  
  constructor(code: string) {
    this.code = code;
  }
}

/**
 * 인증 코드 검증 결과 DTO
 */
export class ValidateAuthCodeResultDto {
  @Expose()
  @IsUUID('4', { message: '유효한 사용자 ID 형식이 아닙니다.' })
  @IsNotEmpty({ message: '사용자 ID는 필수 입력 항목입니다.' })
  userId: string;
  
  @Expose()
  @IsBoolean({ message: '유효성 값은 불리언이어야 합니다.' })
  @IsNotEmpty({ message: '유효성 값은 필수 항목입니다.' })
  isValid: boolean;
  
  constructor(userId: string, isValid: boolean) {
    this.userId = userId;
    this.isValid = isValid;
  }
}