import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsEmail, IsNotEmpty } from 'class-validator'

/**
 * 이메일 중복 확인 요청 DTO
 */
export class CheckEmailAvailabilityRequestDto {
  @ApiProperty({ 
    description: "확인할 이메일 주소", 
    example: "user@example.com",
    format: "email"
  })
  @Expose()
  @IsEmail({}, { message: '유효한 이메일 형식이어야 합니다.' })
  @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다.' })
  email: string
}