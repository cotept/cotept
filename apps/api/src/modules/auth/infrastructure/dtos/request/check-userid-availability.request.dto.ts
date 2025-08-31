import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsNotEmpty, IsString, Length } from 'class-validator'

/**
 * 사용자 ID 중복 확인 요청 DTO
 */
export class CheckUserIdAvailabilityRequestDto {
  @ApiProperty({ 
    description: "확인할 사용자 ID", 
    example: "user123",
    minLength: 4,
    maxLength: 20
  })
  @Expose()
  @IsString({ message: '아이디는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '아이디는 필수 입력 항목입니다.' })
  @Length(4, 20, { message: '아이디는 4-20자 사이여야 합니다.' })
  userId: string
}