import * as fs from "fs"
import { utilities as nestWinstonModuleUtilities, WinstonModule } from "nest-winston"
import * as path from "path"
import * as winston from "winston"
import winstonDaily from "winston-daily-rotate-file"

// const LOG_LEVEL = process.env.LOG_LEVEL || "silly"
const MAX_FILE_SIZE = process.env.LOG_MAX_SIZE || "20m"
const MAX_FILES = process.env.LOG_MAX_FILES || "14d"

const LOG_CONFIG = {
  baseDir: path.join(process.cwd(), "logs"),
  getPath: (level: string) => path.join(path.join(process.cwd(), "logs"), level),
}

const appEnvironment = process.env["NODE_ENV"]
const isProduction = appEnvironment === "production"
const appName = "CotePT"

// 로그 디렉토리 생성
if (!fs.existsSync(LOG_CONFIG.baseDir)) {
  fs.mkdirSync(LOG_CONFIG.baseDir, { recursive: true })
}

// 로그 저장 파일 옵션
const dailyOptions = (level: string) => {
  return {
    level,
    datePattern: "YYYY-MM-DD",
    dirname: LOG_CONFIG.getPath(level),
    filename: `%DATE%.${level}.log`,
    zippedArchive: true,
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES,
    format: winston.format.combine(
      winston.format.timestamp(),
      nestWinstonModuleUtilities.format.nestLike(`${appName}[${appEnvironment}]`, {
        colors: false,
        prettyPrint: true,
      }),
    ),
  }
}

export const winstonLogger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      level: isProduction ? "info" : "silly",
      format: isProduction
        ? winston.format.simple()
        : winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike(`${appName}[${appEnvironment}]`, {
              colors: true,
              prettyPrint: true,
            }),
          ),
    }),
    ...["debug", "info", "warn", "error"].map((level) => new winstonDaily(dailyOptions(level))),
  ],
})
