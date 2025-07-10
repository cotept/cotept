import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common"

import { Request, Response } from "express"

@Catch(HttpException)
export class ApiErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse() as string | { message: string | string[]; error: string }

    const errorMessage = typeof exceptionResponse === "string" ? exceptionResponse : exceptionResponse.message

    response.status(status).json({
      statusCode: status,
      success: false,
      message: Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    })
  }
}

/**
 * 
🚨 NestJS 공통 예외 클래스 목록 (@nestjs/common)
예외 클래스	상태 코드	설명
BadRequestException	400	잘못된 요청 파라미터나 유효성 검사 오류 시 사용
UnauthorizedException	401	인증이 필요한 요청에 대해 인증이 안 된 경우
PaymentRequiredException	402	결제 요구 시 사용 (거의 사용하지 않음)
ForbiddenException	403	권한이 없는 요청에 대해 접근 차단 시 사용
NotFoundException	404	요청한 리소스를 찾을 수 없는 경우
MethodNotAllowedException	405	허용되지 않은 HTTP 메서드로 요청 시 사용
NotAcceptableException	406	클라이언트가 요구하는 응답 콘텐츠를 제공할 수 없을 때
ProxyAuthenticationRequiredException	407	프록시 인증 요구 시 사용
RequestTimeoutException	408	요청 시간이 초과된 경우
ConflictException	409	데이터 중복 또는 충돌이 발생한 경우
GoneException	410	더 이상 사용할 수 없는 리소스 요청 시
LengthRequiredException	411	요청에 필요한 Content-Length 헤더가 없는 경우
PreconditionFailedException	412	사전 조건이 충족되지 않은 경우
PayloadTooLargeException	413	요청 본문이 너무 커서 처리할 수 없는 경우
URITooLongException	414	요청 URI가 너무 길어서 처리할 수 없는 경우
UnsupportedMediaTypeException	415	지원하지 않는 미디어 유형인 경우
RequestedRangeNotSatisfiableException	416	요청 범위가 유효하지 않을 때
ExpectationFailedException	417	클라이언트 기대를 서버가 충족하지 못할 때
IAmATeapotException	418	재미있는 Easter Egg 코드 (I'm a teapot)
UnprocessableEntityException	422	요청은 형식이 맞으나 처리할 수 없는 경우
InternalServerErrorException	500	서버 내부 오류
NotImplementedException	501	구현되지 않은 기능 요청 시 사용
BadGatewayException	502	게이트웨이 또는 프록시 서버 오류
ServiceUnavailableException	503	서버가 현재 사용할 수 없는 경우
GatewayTimeoutException	504	게이트웨이 또는 프록시 서버에서 응답 시간 초과
HTTPVersionNotSupportedException	505	지원하지 않는 HTTP 버전 요청 시

 */
