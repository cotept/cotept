import { BadRequestException, createParamDecorator, ExecutionContext } from "@nestjs/common"

/**
 * ADMIN 역할 생성 시도를 차단하는 데코레이터
 * 회원가입 등에서 보안상 ADMIN 역할을 직접 지정하는 것을 방지
 */
export const PreventAdminRole = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const body = request.body

  // 요청 body에서 role이 ADMIN인지 확인
  if (body && body.role === "ADMIN") {
    throw new BadRequestException("관리자 권한은 시스템에서만 부여할 수 있습니다.")
  }

  return body
})