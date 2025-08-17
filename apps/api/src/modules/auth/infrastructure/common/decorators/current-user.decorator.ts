import { createParamDecorator, ExecutionContext } from "@nestjs/common"

import { Request } from "express"

import { JwtAuthenticatedUser } from "../strategies/jwt.strategy"

/**
 * 현재 인증된 사용자 정보를 추출하는 커스텀 데코레이터
 * JwtAuthGuard로 보호된 라우트에서 사용할 수 있습니다.
 *
 * 사용 예시:
 * ```
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: JwtAuthenticatedUser) {
 *   return user;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): JwtAuthenticatedUser => {
  const request = ctx.switchToHttp().getRequest<Request>()
  return request.user as JwtAuthenticatedUser
})

/**
 * 현재 인증된 사용자의 ID만 추출하는 커스텀 데코레이터
 * JwtAuthGuard로 보호된 라우트에서 사용할 수 있습니다.
 *
 * 사용 예시:
 * ```
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUserId() userId: string) {
 *   return this.userService.getUserById(userId);
 * }
 * ```
 */
export const CurrentUserId = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<Request>()
  const user = request.user as JwtAuthenticatedUser
  return user?.id
})
