import { Expose } from "class-transformer"
import { IsOptional, IsString, IsUUID } from "class-validator"

/**
 * 메일 감사 조회 Application DTO
 */
export class GetMailAuditDto {
  @Expose()
  @IsOptional()
  @IsUUID("4")
  mailId?: string

  @Expose()
  @IsOptional()
  @IsString()
  recipient?: string

  @Expose()
  @IsOptional()
  @IsString()
  template?: string
}
