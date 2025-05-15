import { BadRequestException, HttpException, HttpStatus, UnauthorizedException } from "@nestjs/common"

/**
 * 인증 실패 예외
 * 로그인 실패, 인증 토큰 유효성 검증 실패 등
 */
export class AuthenticationFailedException extends UnauthorizedException {
  constructor(message: string = "인증에 실패했습니다.") {
    super(message)
  }
}

/**
 * 계정 비활성화 예외
 * 비활성화된 계정으로 로그인 시도 등
 */
export class AccountDeactivatedException extends UnauthorizedException {
  constructor(message: string = "비활성화된 계정입니다. 관리자에게 문의하세요.") {
    super(message)
  }
}

/**
 * 검증 실패 예외
 * 인증 코드 검증 실패, 만료 등
 */
export class VerificationException extends BadRequestException {
  constructor(message: string = "인증 코드 검증에 실패했습니다.") {
    super(message)
  }
}

/**
 * 인증 요청 제한 초과 예외
 * 인증 코드 요청 제한 초과, 로그인 시도 횟수 초과 등
 */
export class RateLimitExceededException extends HttpException {
  constructor(message: string = "요청 제한을 초과했습니다. 잠시 후 다시 시도해주세요.") {
    super(message, HttpStatus.TOO_MANY_REQUESTS)
  }
}

/**
 * 잘못된 토큰 예외
 * 잘못된 형식의 토큰, 잘못된 서명 등
 */
export class InvalidTokenException extends UnauthorizedException {
  constructor(message: string = "잘못된 토큰입니다.") {
    super(message)
  }
}

/**
 * 토큰 검증 실패 예외
 * 만료된 토큰, 블랙리스트에 있는 토큰 등
 */
export class TokenValidationException extends UnauthorizedException {
  constructor(message: string = "토큰 검증에 실패했습니다.") {
    super(message)
  }
}

/**
 * 토큰 재사용 감지 예외
 * 이미 사용된 리프레시 토큰 감지
 */
export class TokenReuseDetectedException extends UnauthorizedException {
  constructor(message: string = "비정상적인 토큰 사용이 감지되었습니다. 다시 로그인해주세요.") {
    super(message)
  }
}

/**
 * 토큰 도난 의심 예외
 * 다른 패밀리 ID로 리프레시 토큰 사용 시도 감지
 */
export class TokenTheftSuspectedException extends UnauthorizedException {
  constructor(
    message: string = "토큰 도난이 의심됩니다. 모든 세션을 로그아웃 처리하였습니다. 안전한 환경에서 다시 로그인해주세요.",
  ) {
    super(message)
  }
}

/**
 * 토큰 도난 의심 예외
 * 다른 패밀리 ID로 리프레시 토큰 사용 시도 감지
 */
export class PasswordUpdateFailedException extends UnauthorizedException {
  constructor(message: string = "비밀번호 재설정에 실패하였습니다. 다시 시도해주세요.") {
    super(message)
  }
}
