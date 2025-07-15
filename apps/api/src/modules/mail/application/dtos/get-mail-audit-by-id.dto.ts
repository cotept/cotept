import { Expose } from "class-transformer"
import { IsNotEmpty, IsUUID } from "class-validator"

/**
 * ID로 메일 감사 조회 Application DTO
 */
export class GetMailAuditByIdDto {
  @Expose()
  @IsUUID("4")
  @IsNotEmpty()
  id: string
}
