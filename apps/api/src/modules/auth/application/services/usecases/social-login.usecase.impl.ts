import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { SocialLoginUseCase } from '@/modules/auth/application/ports/in/social-login.usecase';
import { SocialLoginDto } from '@/modules/auth/application/dtos/social-login.dto';
import { AuthUserRepositoryPort } from '@/modules/auth/application/ports/out/auth-user-repository.port';
import { LoginSessionRepositoryPort } from '@/modules/auth/application/ports/out/login-session-repository.port';
import { SocialProfilePort } from '@/modules/auth/application/ports/out/social-profile.port';
import { TokenGeneratorPort } from '@/modules/auth/application/ports/out/token-generator.port';
import { TokenStoragePort } from '@/modules/auth/application/ports/out/token-storage.port';
import { AuthenticationFailedException } from '@/modules/auth/domain/model/auth-exception';
import { LoginSession } from '@/modules/auth/domain/model/login-session';
import { TokenPair } from '@/modules/auth/domain/model/token-pair';

/**
 * 소셜 로그인 유스케이스 구현체
 */
@Injectable()
export class SocialLoginUseCaseImpl implements SocialLoginUseCase {
  constructor(
    private readonly authUserRepository: AuthUserRepositoryPort,
    private readonly loginSessionRepository: LoginSessionRepositoryPort,
    private readonly tokenGenerator: TokenGeneratorPort,
    private readonly tokenStorage: TokenStoragePort,
    private readonly socialProfilePort: SocialProfilePort
  ) {}

  /**
   * 소셜 로그인 처리
   * @param dto 소셜 로그인 정보(제공자, 인증 코드, 리다이렉트 URI, IP, User-Agent)
   * @returns 액세스 토큰과 리프레시 토큰 쌍
   */
  async execute(dto: SocialLoginDto): Promise<TokenPair> {
    // 1. 소셜 프로필 정보 가져오기
    const socialProfile = await this.socialProfilePort.getProfileByCode(
      dto.provider,
      dto.code,
      dto.redirectUri
    );

    if (!socialProfile || !socialProfile.id) {
      throw new AuthenticationFailedException('소셜 로그인 정보를 가져오는데 실패했습니다.');
    }

    if (!socialProfile.email) {
      throw new AuthenticationFailedException('이메일 정보가 제공되지 않았습니다. 소셜 계정의 이메일 제공에 동의해주세요.');
    }

    // 2. 소셜 계정으로 사용자 조회 또는 생성
    let user = await this.authUserRepository.findBySocialId(dto.provider, socialProfile.id);

    // 3. 소셜 계정이 연결되지 않았지만 동일한 이메일의 사용자가 있는 경우
    if (!user && socialProfile.email) {
      user = await this.authUserRepository.findByEmail(socialProfile.email);
      
      // 사용자가 있으면 소셜 계정 연결
      if (user) {
        await this.authUserRepository.connectSocialAccount(
          user.id,
          dto.provider,
          socialProfile.id,
          socialProfile.accessToken,
          socialProfile.refreshToken,
          socialProfile.raw
        );
      } else {
        // 새 사용자 생성
        user = await this.authUserRepository.createSocialUser(
          socialProfile.email,
          socialProfile.name || '',
          dto.provider,
          socialProfile.id,
          socialProfile.accessToken,
          socialProfile.refreshToken,
          socialProfile.profileImageUrl,
          socialProfile.raw
        );
      }
    }

    if (!user) {
      throw new AuthenticationFailedException('사용자 정보를 찾을 수 없습니다.');
    }

    // 4. 계정 상태 확인
    if (!user.canLogin()) {
      throw new AuthenticationFailedException('계정이 활성화되지 않았습니다.');
    }

    // 5. 토큰 생성
    const tokenPair = this.tokenGenerator.generateTokenPair(user.id, user.email, user.role);

    // 6. 리프레시 토큰 패밀리 저장
    if (tokenPair.familyId) {
      await this.tokenStorage.saveRefreshTokenFamily(
        user.id,
        tokenPair.familyId,
        tokenPair.refreshToken,
        tokenPair.refreshTokenExpiresIn,
      );
    }

    // 7. 로그인 세션 생성 및 저장
    const sessionId = uuidv4();
    const loginSession = LoginSession.create(
      sessionId,
      user.id,
      tokenPair.accessToken,
      dto.ipAddress || '',
      dto.userAgent || '',
      tokenPair.accessTokenExpiresIn,
    );
    await this.loginSessionRepository.save(loginSession);

    // 8. 토큰 쌍 반환
    return tokenPair;
  }
}
