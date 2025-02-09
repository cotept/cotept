import { utilities as nestWinstonModuleUtilities, WinstonModule } from "nest-winston"
import * as winston from "winston"

// 환경 설정 및 기본 상수 정의
const appEnvironment = process.env["NODE_ENV"]
const isProduction = appEnvironment === "production"
const appName = "CotePT"

// 개발 환경을 위한 사람이 읽기 쉬운 로그 포맷
// 컬러 하이라이팅과 들여쓰기가 적용된 깔끔한 형태로 출력됩니다
const developmentFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.ms(),
  nestWinstonModuleUtilities.format.nestLike(`${appName}[${appEnvironment}]`, {
    colors: true,
    prettyPrint: true,
  }),
)

// 운영 환경을 위한 JSON 형식의 로그 포맷
// OCI Logging Service에서 쉽게 파싱하고 검색할 수 있는 구조화된 형태로 출력됩니다
const productionFormat = winston.format.combine(winston.format.timestamp(), winston.format.ms(), winston.format.json())

// winston 로거 설정
export const winstonLogger = WinstonModule.createLogger({
  // 개발 환경: debug 레벨부터 수집 (상세한 디버깅 정보 포함)
  // 운영 환경: info 레벨부터 수집 (중요 비즈니스 이벤트부터 수집)
  level: isProduction ? "info" : "debug",

  // 환경에 따라 적절한 포맷 사용
  format: isProduction ? productionFormat : developmentFormat,

  // 단일 콘솔 transport 사용 (Container Instance가 자동으로 수집)
  transports: [new winston.transports.Console()],

  // 모든 로그에 기본적으로 포함될 메타데이터
  defaultMeta: {
    service: appName,
    environment: appEnvironment,
    version: process.env.APP_VERSION || "unknown", // 배포 버전 추적용
  },
})

// debug: 상세한 디버깅 정보 (개발 환경에서만 수집)
// logger.debug('데이터베이스 쿼리 실행', {
//   query: 'SELECT * FROM users WHERE id = ?',
//   parameters: [userId],
//   executionTime: '120ms'
// });

// info: 중요한 비즈니스 이벤트 (모든 환경에서 수집)
// logger.info('새로운 사용자 가입 완료', {
//   userId: 'user123',
//   registrationType: 'email'
// });

// warn: 잠재적 문제 상황 (모든 환경에서 수집)
// logger.warn('데이터베이스 응답 지연', {
//   queryTime: 2500,
//   threshold: 1000
// });

// error: 심각한 오류 상황 (모든 환경에서 수집)
// logger.error('결제 처리 실패', {
//   orderId: 'order123',
//   error: error.message,
//   stack: error.stack
// });
