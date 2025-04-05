// src/swagger/swagger.exporter.ts
import { INestApplication } from "@nestjs/common"
import { OpenAPIObject } from "@nestjs/swagger"
import * as fs from "fs"
import * as yaml from "js-yaml"
import * as path from "path"
import { SwaggerExportOptions } from "./swagger.interface"

export class SwaggerExporter {
  constructor(private readonly options: SwaggerExportOptions) {}

  public export(document: OpenAPIObject, app: INestApplication) {
    if (!this.options.enabled) {
      return
    }

    try {
      // 디렉토리 확인
      const outputDir = path.dirname(this.options.outputPath)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      // YAML 파일로 내보내기
      fs.writeFileSync(this.options.outputPath, yaml.dump(document))
      console.log(`OpenAPI 스펙을 다음 경로에 저장했습니다: ${this.options.outputPath}`)

      // 자동 종료 설정
      if (this.options.autoExit) {
        const delay = this.options.exitDelay || 1000
        console.log(`${delay}ms 후 서버가 자동으로 종료됩니다...`)

        setTimeout(() => {
          app.close()
          process.exit(0)
        }, delay)
      }
    } catch (error) {
      console.error("OpenAPI 스펙 내보내기 실패:", error)
      if (this.options.autoExit) {
        app.close()
        process.exit(1)
      }
    }
  }
}
