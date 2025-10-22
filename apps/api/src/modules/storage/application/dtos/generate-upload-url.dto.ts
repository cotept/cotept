import { ApiProperty } from "@nestjs/swagger"

import { IsNotEmpty, IsString } from "class-validator"

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
}

export class GenerateUploadUrlResponseDto {
  @ApiProperty({
    description: "파일을 업로드할 수 있는 Pre-signed URL",
  })
  uploadUrl: string

  @ApiProperty({
    description: "업로드 성공 후 파일에 접근할 수 있는 최종 URL",
  })
  fileUrl: string
}
