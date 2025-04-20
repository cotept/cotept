import { BadRequestException, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SocialProvider } from '@/modules/auth/application/dtos';

/**
 * 소셜 로그인 가드
 * 지정된 소셜 로그인 전략을 사용하여 인증을 수행합니다.
 */
@Injectable()
export class SocialAuthGuard extends AuthGuard(['google', 'kakao', 'naver', 'github']) {
  // 지원되는 소셜 로그인 제공자
  private readonly supportedProviders = Object.values(SocialProvider);
  
  constructor() {
    super();
  }

  /**
   * 요청 경로에 따라 적절한 소셜 로그인 전략을 선택합니다.
   * @param context 실행 컨텍스트
   * @returns 인증 결과
   */
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const provider = request.params.provider;
    
    // 유효한 소셜 로그인 제공자인지 확인
    if (!this.supportedProviders.includes(provider)) {
      throw new BadRequestException(`지원되지 않는 소셜 로그인 제공자입니다: ${provider}`);
    }
    
    // 해당 제공자의 AuthGuard를 생성하여 인증 처리
    return AuthGuard(provider).canActivate(context);
  }
  
  /**
   * 인증 결과를 요청 객체에 할당합니다.
   * @param err 에러 정보
   * @param user 인증된 사용자
   * @param info 추가 정보
   * @param context 실행 컨텍스트
   */
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err) {
      throw err || new UnauthorizedException('소셜 인증에 실패했습니다.');
    }
    
    if (!user) {
      throw new UnauthorizedException('사용자 정보를 가져오는데 실패했습니다.');
    }
    
    return user;
  }
}
