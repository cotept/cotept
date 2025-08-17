import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

import { AuthType } from '@/modules/auth/domain/model/auth-verification';

/**
 * 인증 코드 발송 DTO
 */
export class SendVerificationCodeDto {
  @Expose()
  @IsOptional()
  @IsUUID('4', { message: '유효한 사용자 ID 형식이 아닙니다.' })
  userId?: string;

  @Expose()
  @IsEnum(AuthType, { message: '유효한 인증 유형이 아닙니다.' })
  @IsNotEmpty({ message: '인증 유형은 필수 입력 항목입니다.' })
  authType: AuthType;

  @Expose()
  @IsString({ message: '인증 대상은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '인증 대상은 필수 입력 항목입니다.' })
  target: string;

  @Expose()
  @IsOptional()
  @IsString()
  ipAddress?: string;
}
