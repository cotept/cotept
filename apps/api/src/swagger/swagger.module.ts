// src/swagger/swagger.module.ts
import { INestApplication } from "@nestjs/common"
import * as path from "path"
import { SwaggerConfig } from "./swagger.config"
import { SwaggerExporter } from "./swagger.exporter"
import { SwaggerExportOptions } from "./swagger.interface"

export class SwaggerModule {
  private readonly config: SwaggerConfig
  private readonly exporter: SwaggerExporter

  constructor() {
    this.config = new SwaggerConfig()

    // 환경 변수에 따라 내보내기 설정
    const exportOptions: SwaggerExportOptions = {
      enabled: process.env.EXPORT_OPENAPI === "true",
      outputPath: path.resolve(__dirname, "../../../packages/api-client/openapi-spec.yaml"),
      autoExit: process.env.EXPORT_OPENAPI === "true",
      exitDelay: 1000,
    }

    this.exporter = new SwaggerExporter(exportOptions)
  }

  public setup(app: INestApplication) {
    // 개발 환경에서만 Swagger UI 설정
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "local") {
      const document = this.config.setup(app)

      // OpenAPI 스펙 내보내기
      this.exporter.export(document, app)

      return document
    }

    return null
  }
}
