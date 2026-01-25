import { Expose } from "class-transformer"
import { IsNotEmpty, IsNumber } from "class-validator"

/**
 * ID로 메일 감사 조회 Application DTO
 */
export class GetMailAuditByIdDto {
  @Expose()
  @IsNumber()
  @IsNotEmpty()
  idx: number
}
