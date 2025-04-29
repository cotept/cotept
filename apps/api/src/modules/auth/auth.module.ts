import { CacheModule } from "@/shared/infrastructure/cache/redis/cache.module"
import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"
import { TypeOrmModule } from "@nestjs/typeorm"

// 영속성 엔티티
import {
  AuthVerificationEntity,
  IdentityProviderEntity,
  OAuthProviderEntity,
  PhoneVerificationEntity,
  SessionLogEntity,
  TermsAgreementEntity,
  TermsEntity,
  UserOAuthAccountEntity,
} from "@/modules/auth/infrastructure/adapter/out/persistence/entities"
import { UserEntity as User } from "@/modules/user/infrastructure/adapter/out/persistence/entities/user.entity"
// 레포지토리
import {
  DummySocialProfileService,
  RedisTokenStorageRepository,
  TypeOrmAuthUserRepository,
  TypeOrmAuthVerificationRepository,
  TypeOrmLoginSessionRepository,
} from "@/modules/auth/infrastructure/adapter/out/persistence/repositories"

// 매퍼
import { TokenMapper } from "@/modules/auth/application/mappers"
import { AuthRequestMapper } from "@/modules/auth/infrastructure/adapter/in/mappers"
import {
  AuthVerificationPersistenceMapper,
  LoginSessionPersistenceMapper,
} from "@/modules/auth/infrastructure/adapter/out/persistence/mappers"
import { JwtTokenGeneratorAdapter, PasswordHasherAdapter } from "@/modules/auth/infrastructure/adapter/out/services"
import { CookieManagerAdapter } from "@/modules/auth/infrastructure/adapter/out/services/cookie-manager.adapter"

// 유스케이스
import {
  GenerateAuthCodeUseCaseImpl,
  LoginUseCaseImpl,
  LogoutUseCaseImpl,
  RefreshTokenUseCaseImpl,
  SendVerificationCodeUseCaseImpl,
  SocialAuthCallbackUseCaseImpl,
  SocialLoginUseCaseImpl,
  ValidateAuthCodeUseCaseImpl,
  ValidateTokenUseCaseImpl,
  VerifyCodeUseCaseImpl,
} from "@/modules/auth/application/services/usecases"

// 파사드 서비스
import { AuthFacadeService } from "@/modules/auth/application/services/facade"

// 포트 (인터페이스)
import { AuthUserRepositoryPort } from "@/modules/auth/application/ports/out/auth-user-repository.port"
import { AuthVerificationRepositoryPort } from "@/modules/auth/application/ports/out/auth-verification-repository.port"
import { LoginSessionRepositoryPort } from "@/modules/auth/application/ports/out/login-session-repository.port"
import { TokenGeneratorPort } from "@/modules/auth/application/ports/out/token-generator.port"
import { TokenStoragePort } from "@/modules/auth/application/ports/out/token-storage.port"

import { GenerateAuthCodeUseCase } from "@/modules/auth/application/ports/in/generate-auth-code.usecase"
import { LoginUseCase } from "@/modules/auth/application/ports/in/login.usecase"
import { LogoutUseCase } from "@/modules/auth/application/ports/in/logout.usecase"
import { RefreshTokenUseCase } from "@/modules/auth/application/ports/in/refresh-token.usecase"
import { SendVerificationCodeUseCase } from "@/modules/auth/application/ports/in/send-verification-code.usecase"
import { SocialAuthCallbackUseCase } from "@/modules/auth/application/ports/in/social-auth-callback.usecase"
import { SocialLoginUseCase } from "@/modules/auth/application/ports/in/social-login.usecase"
import { ValidateAuthCodeUseCase } from "@/modules/auth/application/ports/in/validate-auth-code.usecase"
import { ValidateTokenUseCase } from "@/modules/auth/application/ports/in/validate-token.usecase"
import { VerifyCodeUseCase } from "@/modules/auth/application/ports/in/verify-code.usecase"

// 컨트롤러
import {
  AuthController,
  GithubAuthController,
  GoogleAuthController,
} from "@/modules/auth/infrastructure/adapter/in/controllers"
// 가드
import { JwtAuthGuard } from "@/modules/auth/infrastructure/common/guards"
// 전략
import { JwtConfig } from "@/configs/token"
import { PasswordHasherPort } from "@/modules/auth/application/ports/out/password-hasher.port"
import {
  GithubStrategy,
  GoogleStrategy,
  JwtStrategy,
  LocalStrategy,
} from "@/modules/auth/infrastructure/common/strategies"
import { CryptoService } from "@/shared/infrastructure/services"
import { NotificationPort, SocialProfilePort } from "./application/ports/out"
import { DummyNotificationService } from "./infrastructure/adapter/out/services/notification.adapter"

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    TypeOrmModule.forFeature([
      User,
      AuthVerificationEntity,
      SessionLogEntity,
      OAuthProviderEntity,
      UserOAuthAccountEntity,
      IdentityProviderEntity,
      PhoneVerificationEntity,
      TermsEntity,
      TermsAgreementEntity,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<JwtConfig>("jwt").jwtSecret,
        signOptions: {
          expiresIn: configService.getOrThrow<JwtConfig>("jwt").accessExpiresIn,
        },
      }),
    }),
    CacheModule,
  ],
  controllers: [AuthController, GithubAuthController, GoogleAuthController],
  providers: [
    // 파사드 서비스 - AuthService는 제거하고 AuthFacadeService만 사용
    AuthFacadeService,

    // 매퍼
    AuthVerificationPersistenceMapper,
    LoginSessionPersistenceMapper,
    AuthRequestMapper,
    TokenMapper,

    // 레포지토리 구현체
    {
      provide: AuthUserRepositoryPort,
      useClass: TypeOrmAuthUserRepository,
    },
    {
      provide: AuthVerificationRepositoryPort,
      useClass: TypeOrmAuthVerificationRepository,
    },
    {
      provide: LoginSessionRepositoryPort,
      useClass: TypeOrmLoginSessionRepository,
    },
    {
      provide: TokenStoragePort,
      useClass: RedisTokenStorageRepository,
    },

    // 유스케이스 구현체
    {
      provide: LoginUseCase,
      useClass: LoginUseCaseImpl,
    },
    {
      provide: LogoutUseCase,
      useClass: LogoutUseCaseImpl,
    },
    {
      provide: RefreshTokenUseCase,
      useClass: RefreshTokenUseCaseImpl,
    },
    {
      provide: ValidateTokenUseCase,
      useClass: ValidateTokenUseCaseImpl,
    },
    {
      provide: SendVerificationCodeUseCase,
      useClass: SendVerificationCodeUseCaseImpl,
    },
    {
      provide: VerifyCodeUseCase,
      useClass: VerifyCodeUseCaseImpl,
    },
    {
      provide: SocialLoginUseCase,
      useClass: SocialLoginUseCaseImpl,
    },
    {
      provide: SocialAuthCallbackUseCase,
      useClass: SocialAuthCallbackUseCaseImpl,
    },
    {
      provide: GenerateAuthCodeUseCase,
      useClass: GenerateAuthCodeUseCaseImpl,
    },
    {
      provide: ValidateAuthCodeUseCase,
      useClass: ValidateAuthCodeUseCaseImpl,
    },

    // 가드
    JwtAuthGuard,

    // 전략
    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
    GithubStrategy,

    // 서비스
    {
      provide: PasswordHasherPort,
      useClass: PasswordHasherAdapter,
    },

    // 토큰 생성기
    {
      provide: TokenGeneratorPort,
      useClass: JwtTokenGeneratorAdapter,
    },

    // 쿠키 관리 어댑터
    CookieManagerAdapter,
    //---------------------------더미---------------------------
    // 더미 NotificationService 어댑터
    {
      provide: NotificationPort,
      useClass: DummyNotificationService,
    },
    // 더미 SocialProfilePort 구현체 제공
    {
      provide: SocialProfilePort,
      useClass: DummySocialProfileService,
    },
    //--------------------------------------------------------

    // shared
    CryptoService,
  ],
  exports: [
    LoginUseCase,
    LogoutUseCase,
    RefreshTokenUseCase,
    ValidateTokenUseCase,
    SendVerificationCodeUseCase,
    VerifyCodeUseCase,
    SocialLoginUseCase,
    SocialAuthCallbackUseCase,
    GenerateAuthCodeUseCase,
    ValidateAuthCodeUseCase,
    TokenGeneratorPort,
    JwtAuthGuard,
    AuthFacadeService, // AuthFacadeService를 내보내도록 추가
  ],
})
export class AuthModule {}
