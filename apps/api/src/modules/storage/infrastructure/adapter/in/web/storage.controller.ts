import { Body, Controller, Post, UseGuards } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"

import { JwtAuthGuard } from "@/modules/auth/infrastructure/common/guards"
import { JwtAuthenticatedUser } from "@/modules/auth/infrastructure/common/strategies"
import {
  GenerateUploadUrlRequestDto,
  GenerateUploadUrlResponseDto,
} from "@/modules/storage/application/dtos/generate-upload-url.dto"
import { StorageFacadeService } from "@/modules/storage/application/services/facade/storage-facade.service"
import { ApiOkResponseWrapper, CurrentUser } from "@/shared/infrastructure/decorators"

@ApiTags("Storage")
@Controller("storage")
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly storageFacadeService: StorageFacadeService) {}

  @Post("upload-url")
  @ApiOperation({
    summary: "파일 업로드를 위한 Pre-signed URL 생성",
    description: "클라이언트가 OCI Object Storage에 직접 파일을 업로드할 수 있는 임시 URL을 발급합니다.",
  })
  @ApiOkResponseWrapper(GenerateUploadUrlResponseDto)
  async generateUploadUrl(
    @CurrentUser() user: JwtAuthenticatedUser,
    @Body() dto: GenerateUploadUrlRequestDto,
  ): Promise<GenerateUploadUrlResponseDto> {
    return this.storageFacadeService.generateUploadUrl(dto, user.id)
  }
}
