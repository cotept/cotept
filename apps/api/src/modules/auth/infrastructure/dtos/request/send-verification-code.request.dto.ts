import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';
import { AuthType } from '@/modules/auth/domain/model/auth-verification';

/**
 * 인증 코드 발송 요청 DTO
 */
export class SendVerificationCodeRequestDto {
  @ApiProperty({
    description: '인증 유형',
    example: AuthType.EMAIL,
    enum: AuthType,
    enumName: 'AuthType',
  })
  @Expose()
  @IsEnum(AuthType, { message: '유효한 인증 유형이 아닙니다.' })
  @IsNotEmpty({ message: '인증 유형은 필수 입력 항목입니다.' })
  authType: AuthType;

  @ApiProperty({
    description: '인증 대상 (이메일 또는 전화번호)',
    example: 'user@example.com',
  })
  @Expose()
  @IsString({ message: '인증 대상은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '인증 대상은 필수 입력 항목입니다.' })
  target: string;
}
