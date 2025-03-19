import { ApiProperty } from "@nestjs/swagger"

export class LoginResponseDto {
  @ApiProperty({
    description: "인증 성공 여부",
    example: true,
  })
  success: boolean

  @ApiProperty({
    description: "액세스 토큰",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  accessToken: string

  @ApiProperty({
    description: "리프레시 토큰",
    example: "dsdsds...",
  })
  refreshToken: string

  @ApiProperty({
    description: "사용자 역할",
    example: "mentee",
    enum: ["mentee", "mentor", "admin"],
  })
  role: string
}
