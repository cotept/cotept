import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

import { v4 as uuidv4 } from "uuid"

import { OciConfig } from "@/configs/oci"
import {
  GenerateUploadUrlRequestDto,
  GenerateUploadUrlResponseDto,
} from "@/modules/storage/application/dtos/generate-upload-url.dto"
import { ObjectStorageService } from "@/shared/infrastructure/oci/services/object-storage.service"

@Injectable()
export class GenerateUploadUrlUseCase {
  constructor(
    private readonly objectStorageService: ObjectStorageService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    dto: GenerateUploadUrlRequestDto,
    userId: string, // 실제로는 @CurrentUser() 등으로 받아온 사용자 ID
  ): Promise<GenerateUploadUrlResponseDto> {
    const ociConfig = this.configService.get<OciConfig>("oci")
    if (!ociConfig) {
      throw new Error("OCI configuration not found")
    }

    const fileExtension = dto.fileName.split(".").pop() || "bin"
    const uniqueFileName = `${uuidv4()}.${fileExtension}`
    const objectName = `users/${userId}/profile/${uniqueFileName}`

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10분 후 만료

    const uploadUrl = await this.objectStorageService.createPAR({
      objectName,
      parName: `par-for-${uniqueFileName}`,
      accessType: "ObjectWrite",
      expiresAt,
    })

    const { namespace, bucketName } = ociConfig.objectStorage
    const { region } = ociConfig

    // 최종 파일 URL 구성
    const fileUrl = `https://objectstorage.${region}.oraclecloud.com/n/${namespace}/b/${bucketName}/o/${objectName}`

    return { uploadUrl, fileUrl }
  }
}
