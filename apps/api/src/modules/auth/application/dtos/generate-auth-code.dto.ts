import { Expose } from 'class-transformer';
import { IsNotEmpty, IsUUID } from 'class-validator';

/**
 * 인증 코드 생성 DTO
 */
export class GenerateAuthCodeDto {
  @Expose()
  @IsUUID('4', { message: '유효한 사용자 ID 형식이 아닙니다.' })
  @IsNotEmpty({ message: '사용자 ID는 필수 입력 항목입니다.' })
  userId: string;
  
  constructor(userId: string) {
    this.userId = userId;
  }
}

/**
 * 인증 코드 생성 결과 DTO
 */
export class GenerateAuthCodeResultDto {
  @Expose()
  @IsNotEmpty({ message: '인증 코드는 필수 항목입니다.' })
  code: string;
  
  @Expose()
  @IsNotEmpty({ message: '만료 시간은 필수 항목입니다.' })
  expiresAt: Date;
  
  constructor(code: string, expiresAt: Date) {
    this.code = code;
    this.expiresAt = expiresAt;
  }
}