import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Expose } from 'class-transformer';

/**
 * 로그인 요청 DTO
 */
export class LoginRequestDto {
  @ApiProperty({
    example: 'user123',
    description: '사용자 아이디',
  })
  @Expose()
  @IsString({ message: '아이디는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '아이디는 필수 입력 항목입니다.' })
  id: string;

  @ApiProperty({
    example: 'Password123!',
    description: '사용자 비밀번호',
  })
  @Expose()
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '비밀번호는 필수 입력 항목입니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  password: string;
}
