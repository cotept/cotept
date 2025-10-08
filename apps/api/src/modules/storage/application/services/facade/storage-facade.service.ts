import { Injectable } from "@nestjs/common"

import {
  GenerateUploadUrlRequestDto,
  GenerateUploadUrlResponseDto,
} from "@/modules/storage/application/dtos/generate-upload-url.dto"
import { GenerateUploadUrlUseCase } from "@/modules/storage/application/services/usecases/generate-upload-url.usecase"

@Injectable()
export class StorageFacadeService {
  constructor(private readonly generateUploadUrlUseCase: GenerateUploadUrlUseCase) {}

  async generateUploadUrl(dto: GenerateUploadUrlRequestDto, userId: string): Promise<GenerateUploadUrlResponseDto> {
    return this.generateUploadUrlUseCase.execute(dto, userId)
  }
}
