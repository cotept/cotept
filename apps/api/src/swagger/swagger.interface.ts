// src/swagger/swagger.interface.ts

export interface ISwaggerConfig {
  path: string
  title: string
  description: string
  version: string
  tags: Array<{ name: string; description: string }>
}

export interface SwaggerExportOptions {
  enabled: boolean
  outputPath: string
  autoExit?: boolean
  exitDelay?: number
}
