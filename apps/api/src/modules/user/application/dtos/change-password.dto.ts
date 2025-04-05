import { IsNotSequential } from "@/shared/infrastructure/common/validators/is-not-sequential.validator"
import { ApiProperty } from "@nestjs/swagger"
import { Expose } from "class-transformer"
import { IsNotEmpty, IsString, Length, Matches, Validate } from "class-validator"

/**
 * 비밀번호 변경 DTO
 */
export class ChangePasswordDto {
  @ApiProperty({
    description: "현재 비밀번호",
    example: "CurrentP@ss123",
  })
  @Expose()
  @IsString({ message: "현재 비밀번호는 문자열이어야 합니다." })
  @IsNotEmpty({ message: "현재 비밀번호는 필수 값입니다." })
  currentPassword: string

  @ApiProperty({
    description: "새 비밀번호 (8~32자, 대소문자, 숫자, 특수문자 포함)",
    example: "NewStrongP@ss123",
  })
  @Expose()
  @IsString({ message: "새 비밀번호는 문자열이어야 합니다." })
  @IsNotEmpty({ message: "새 비밀번호는 필수 값입니다." })
  @Length(8, 32, { message: "비밀번호는 8자 이상 32자 이하여야 합니다." })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,32}$/, {
    message: "비밀번호는 최소 하나의 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.",
  })
  @Validate(IsNotSequential, { message: "비밀번호에 연속된 문자나 숫자(123, abc 등)를 사용할 수 없습니다." })
  newPassword: string

  @ApiProperty({
    description: "새 비밀번호 확인",
    example: "NewStrongP@ss123",
  })
  @Expose()
  @IsString({ message: "비밀번호 확인은 문자열이어야 합니다." })
  @IsNotEmpty({ message: "비밀번호 확인은 필수 값입니다." })
  confirmPassword: string
}
