import { Expose } from "class-transformer"
import { IsIn, IsNotEmpty, IsOptional, IsString, Length } from "class-validator"

/**
 * 아이디 찾기 DTO
 * 이메일 또는 전화번호로 인증한 사용자의 아이디(이메일)를 찾기 위한 정보
 */
export class FindIdDto {
  /** 인증 방식 (이메일 또는 전화번호) */
  @Expose()
  @IsString({ message: "인증 타입은 문자열이어야 합니다." })
  @IsNotEmpty({ message: "인증 타입은 필수 항목입니다." })
  @IsIn(["EMAIL", "PHONE"], { message: "인증 타입은 'EMAIL' 또는 'PHONE'이어야 합니다." })
  authType: "EMAIL" | "PHONE"
  
  /** 인증 대상 (이메일 주소 또는 전화번호) */
  @Expose()
  @IsString({ message: "인증 대상은 문자열이어야 합니다." })
  @IsNotEmpty({ message: "인증 대상은 필수 항목입니다." })
  target: string
  
  /** 인증 ID (인증 코드 발송 후 받은 ID) */
  @Expose()
  @IsString({ message: "인증 ID는 문자열이어야 합니다." })
  @IsNotEmpty({ message: "인증 ID는 필수 항목입니다." })
  verificationId: string
  
  /** 인증 코드 */
  @Expose()
  @IsString({ message: "인증 코드는 문자열이어야 합니다." })
  @IsNotEmpty({ message: "인증 코드는 필수 항목입니다." })
  @Length(6, 6, { message: "인증 코드는 6자리여야 합니다." })
  verificationCode: string
  
  /** IP 주소 */
  @Expose()
  @IsOptional()
  @IsString({ message: "IP 주소는 문자열이어야 합니다." })
  ipAddress?: string
}
