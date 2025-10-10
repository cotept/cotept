// src/swagger/swagger.config.ts
import { INestApplication } from "@nestjs/common"
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from "@nestjs/swagger"

import { ISwaggerConfig } from "./swagger.interface"

import { Tier, TierLevel } from "@/modules/baekjoon/domain/vo"
import { TierLevelSchema, TierMetadataDto } from "@/shared/infrastructure/dto/tier-metadata.dto"

export class SwaggerConfig {
  private readonly config: ISwaggerConfig = {
    path: "api-docs",
    title: "CotePT API",
    description: "코딩 테스트 멘토링 플랫폼 API",
    version: "1.0",
    tags: [
      { name: "auth", description: "인증 관련 API" },
      { name: "mentee", description: "멘티 관련 API" },
      { name: "mentor", description: "멘토 관련 API" },
      { name: "mentoring", description: "멘토링 관련 API" },
      { name: "admin", description: "관리자 관련 API" },
    ],
  }

  private readonly customOptions: SwaggerCustomOptions = {
    yamlDocumentUrl: "api-yaml",
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: "none",
    },
  }

  private buildDocumentOptions() {
    const builder = new DocumentBuilder()
      .setTitle(this.config.title)
      .setDescription(this.config.description)
      .setVersion(this.config.version)

    // 태그 추가
    this.config.tags.forEach((tag) => {
      builder.addTag(tag.name, tag.description)
    })

    // 인증 설정
    builder.addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "JWT 토큰을 입력하세요",
        in: "header",
      },
      "access-token",
    )

    return builder.build()
  }

  public setup(app: INestApplication) {
    const config = this.buildDocumentOptions()
    const document = SwaggerModule.createDocument(app, config, {
      extraModels: [TierMetadataDto, TierLevelSchema],
      operationIdFactory: (controllerKey: string, methodKey: string) => {
        // 간단한 메소드명 정리
        return methodKey
          .replace(/^get([A-Z])/, "get$1") // getXXX -> getXXX (그대로)
          .replace(/^getAll([A-Z])/, "get$1s") // getAllUsers -> getUsers (오타 수정)
          .replace(/^findAll/, "getAll") // findAll -> getAll
          .replace(/^findOne/, "getById") // findOne -> getById
          .replace(/^remove/, "delete") // remove -> delete
      },
    })

    // 공통 스키마 컴포넌트 추가 및 예시 데이터 주입
    this.addCommonSchemas(document)

    SwaggerModule.setup(this.config.path, app, document, this.customOptions)
    return document
  }

  private addCommonSchemas(document: any) {
    // 공통 enum 스키마 컴포넌트 정의
    if (!document.components) {
      document.components = {}
    }
    if (!document.components.schemas) {
      document.components.schemas = {}
    }

    // TierMetadataDto에 동적 데이터 예시 주입
    if (document.components.schemas.TierMetadataDto) {
      document.components.schemas.TierMetadataDto["example"] = {
        tiers: Tier.getAllTiers(),
        mentorEligibilityTier: TierLevel.PLATINUM_III,
      }
    }

    // AuthType 공통 스키마
    document.components.schemas.AuthType = {
      type: "string",
      enum: ["PHONE", "EMAIL", "COMPANY"],
      description: "인증 유형",
    }

    // UserRole 공통 스키마
    document.components.schemas.UserRole = {
      type: "string",
      enum: ["MENTEE", "MENTOR", "ADMIN"],
      description: "사용자 역할",
    }

    // UserStatus 공통 스키마
    document.components.schemas.UserStatus = {
      type: "string",
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      description: "사용자 상태",
    }

    // MailStatus 공통 스키마
    document.components.schemas.MailStatus = {
      type: "string",
      enum: ["PENDING", "SENT", "FAILED"],
      description: "메일 상태",
    }
  }
}
