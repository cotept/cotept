import { ApiProperty } from "@nestjs/swagger"
import { Expose } from "class-transformer"
import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator"

/**
 * 사용자 삭제 DTO
 * 사용자 삭제 시 추가 옵션을 지정하기 위한 데이터 전송 객체
 */
export class DeleteUserDto {
  @ApiProperty({
    description: "삭제 이유 (선택적)",
    example: "서비스 이용 중단",
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsString()
  reason?: string

  @ApiProperty({
    description: "삭제 유형 (소프트 삭제 또는 하드 삭제)",
    enum: ["SOFT", "HARD"],
    default: "SOFT",
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsEnum(["SOFT", "HARD"], { message: "삭제 유형은 SOFT 또는 HARD만 가능합니다." })
  deleteType?: "SOFT" | "HARD" = "SOFT"

  @ApiProperty({
    description: "연관된 데이터도 함께 삭제 여부",
    default: false,
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsBoolean({ message: "연관 데이터 삭제 여부는 불리언 값이어야 합니다." })
  deleteRelatedData?: boolean = false
}
