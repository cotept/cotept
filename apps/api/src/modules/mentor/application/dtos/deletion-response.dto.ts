import { ApiProperty } from "@nestjs/swagger"

export class DeletionResponseDto {
  @ApiProperty({ description: "작업 성공 여부", example: true })
  success: boolean

  @ApiProperty({ description: "응답 메시지", example: "성공적으로 삭제되었습니다." })
  message: string
}
