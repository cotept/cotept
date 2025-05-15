import { ApiProperty } from "@nestjs/swagger"
import { IsIn, IsNotEmpty, IsString, Length } from "class-validator"

/**
 * 아이디 찾기 요청 DTO
 */
export class FindIdRequestDto {
  @ApiProperty({
    description: "인증 방식 ('EMAIL' 또는 'PHONE')",
    example: "PHONE",
    enum: ["EMAIL", "PHONE"],
  })
  @IsString({ message: "인증 타입은 문자열이어야 합니다." })
  @IsNotEmpty({ message: "인증 타입은 필수 항목입니다." })
  @IsIn(["EMAIL", "PHONE"], { message: "인증 타입은 'EMAIL' 또는 'PHONE'이어야 합니다." })
  authType: "EMAIL" | "PHONE"

  @ApiProperty({
    description: "인증 대상 (이메일 주소 또는 전화번호)",
    example: "010-1234-5678",
  })
  @IsString({ message: "인증 대상은 문자열이어야 합니다." })
  @IsNotEmpty({ message: "인증 대상은 필수 항목입니다." })
  target: string

  @ApiProperty({
    description: "인증 ID (인증 코드 발송 후 받은 ID)",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  })
  @IsString({ message: "인증 ID는 문자열이어야 합니다." })
  @IsNotEmpty({ message: "인증 ID는 필수 항목입니다." })
  verificationId: string

  @ApiProperty({
    description: "인증 코드",
    example: "123456",
  })
  @IsString({ message: "인증 코드는 문자열이어야 합니다." })
  @IsNotEmpty({ message: "인증 코드는 필수 항목입니다." })
  @Length(6, 6, { message: "인증 코드는 6자리여야 합니다." })
  verificationCode: string
}
