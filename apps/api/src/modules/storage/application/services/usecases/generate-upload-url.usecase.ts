import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

import { v4 as uuidv4 } from "uuid"

import { OciConfig } from "@/configs/oci"
import {
  GenerateUploadUrlRequestDto,
  GenerateUploadUrlResponseDto,
} from "@/modules/storage/application/dtos/generate-upload-url.dto"
import { UploadPathStrategyFactory } from "@/modules/storage/application/services/strategies/upload-path.strategy"
import { UPLOAD_TYPE_ALLOWED_EXTENSIONS, UPLOAD_TYPE_MAX_SIZE } from "@/modules/storage/domain/vo/upload-type.vo"
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
    additionalContext?: Record<string, string>, // 세션 ID 등 추가 컨텍스트
  ): Promise<GenerateUploadUrlResponseDto> {
    const ociConfig = this.configService.get<OciConfig>("oci")
    if (!ociConfig) {
      throw new Error("OCI configuration not found")
    }

    const { cdnBaseUrl } = ociConfig.objectStorage
    if (!cdnBaseUrl) {
      throw new Error("CDN Base URL not configured")
    }

    // 1. 파일 확장자 검증
    const fileExtension = dto.fileName.split(".").pop()?.toLowerCase() || ""
    const allowedExtensions = UPLOAD_TYPE_ALLOWED_EXTENSIONS[dto.uploadType]

    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error(`Invalid file extension for ${dto.uploadType}. Allowed: ${allowedExtensions.join(", ")}`)
    }

    // 2. 파일 크기 제한 정보 가져오기
    const maxSize = UPLOAD_TYPE_MAX_SIZE[dto.uploadType]

    // 3. 고유 파일명 생성
    const uniqueFileName = `${uuidv4()}.${fileExtension}`

    // 4. 업로드 타입에 따른 경로 전략 선택 및 경로 생성
    const strategy = UploadPathStrategyFactory.getStrategy(dto.uploadType)
    const { objectName, visibility } = strategy.generatePath(userId, uniqueFileName, additionalContext)

    // 5. 짧은 수명의 임시 쓰기 PAR 생성 (보안 강화)
    // visibility에 따라 TTL 조정: public은 1분, private은 30초
    const ttlMinutes = visibility === "public" ? 1 : 0.5
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000)

    const parResult = await this.objectStorageService.createPAR({
      objectName,
      parName: `par-upload-${uniqueFileName}`,
      accessType: "ObjectWrite",
      expiresAt,
    })

    // 6. CDN을 통한 최종 파일 URL 생성
    const fileUrl = `${cdnBaseUrl}/${objectName}`

    return {
      uploadUrl: parResult.url,
      fileUrl,
      maxSize, // 클라이언트가 업로드 전 파일 크기 검증에 사용
      expiresAt, // 클라이언트가 만료 시간 체크 및 UI 타이머 표시
      visibility, // 클라이언트가 파일 접근 정책 이해에 사용
    }
  }
}
