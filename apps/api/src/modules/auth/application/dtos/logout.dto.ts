import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

/**
 * 로그아웃 DTO
 */
export class LogoutDto {
  @Expose()
  @IsUUID('4', { message: '유효한 사용자 ID 형식이 아닙니다.' })
  @IsNotEmpty({ message: '사용자 ID는 필수 입력 항목입니다.' })
  userId: string;

  @Expose()
  @IsString({ message: '토큰은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '토큰은 필수 입력 항목입니다.' })
  token: string;
}
