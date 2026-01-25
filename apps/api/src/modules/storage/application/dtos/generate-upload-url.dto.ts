import { ApiProperty } from "@nestjs/swagger"

import { IsEnum, IsNotEmpty, IsString } from "class-validator"

import { UploadType } from "@/modules/storage/domain/vo/upload-type.vo"

export class GenerateUploadUrlRequestDto {
  @ApiProperty({
    description: "업로드할 파일의 이름 (확장자 포함)",
    example: "profile.jpg",
  })
  @IsString()
  @IsNotEmpty()
  fileName: string

  @ApiProperty({
    description: "파일의 Content-Type (MIME 타입)",
    example: "image/jpeg",
  })
  @IsString()
  @IsNotEmpty()
  contentType: string

  @ApiProperty({
    description: "업로드 파일의 용도 (타입)",
    enum: UploadType,
    example: UploadType.USER_PROFILE,
  })
  @IsEnum(UploadType)
  @IsNotEmpty()
  uploadType: UploadType
}

export class GenerateUploadUrlResponseDto {
  @ApiProperty({
    description: "파일을 업로드할 수 있는 Pre-signed URL (1분 유효)",
  })
  uploadUrl: string

  @ApiProperty({
    description: "업로드 성공 후 파일에 접근할 수 있는 최종 URL",
  })
  fileUrl: string

  @ApiProperty({
    description: "업로드 가능한 최대 파일 크기 (바이트)",
    example: 5242880, // 5MB
  })
  maxSize: number

  @ApiProperty({
    description: "PAR 만료 시간 (ISO 8601 형식)",
    example: "2025-11-06T12:34:56.789Z",
  })
  expiresAt: Date

  @ApiProperty({
    description: "파일 가시성 (public: CDN 접근 가능, private: 인증 필요)",
    enum: ["public", "private"],
    example: "public",
  })
  visibility: "public" | "private"
}
