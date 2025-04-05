// src/swagger/swagger.config.ts
import { INestApplication } from "@nestjs/common"
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from "@nestjs/swagger"
import { ISwaggerConfig } from "./swagger.interface"

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
    const options = this.buildDocumentOptions()
    const document = SwaggerModule.createDocument(app, options)
    SwaggerModule.setup(this.config.path, app, document, this.customOptions)
    return document
  }
}
