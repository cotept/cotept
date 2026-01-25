# 코테피티 인증 시스템 구현 문서 (업데이트)

이 문서는 코테피티(Cotept) 서비스의 인증 시스템 구현에 관한 내용을 설명합니다.

## 1. 인증 아키텍처 개요

코테피티의 인증 시스템은 도메인 주도 설계(DDD)와 어니언 아키텍처를 따르며, 다음과 같은 구성요소로 이루어져 있습니다:

- **액세스 토큰**: JWT 기반, 클라이언트 메모리에 저장
- **리프레시 토큰**: JWT 기반, HTTP-Only 쿠키에 저장
- **리프레시 토큰**: JWT 기반, HTTP-Only 쿠키에 저장

### 1.1 계층 구조

```
auth
 ┣ application
 ┃ ┣ ports
 ┃ ┃ ┣ in
 ┃ ┃ ┗ out
 ┃ ┗ services
 ┃ ┃ ┗ usecases
 ┣ domain
 ┃ ┣ aggregates
 ┃ ┣ model
 ┃ ┗ vo
 ┣ infrastructure
 ┃ ┣ adapter
 ┃ ┃ ┣ in
 ┃ ┃ ┗ out
 ┃ ┃ ┃ ┣ external
 ┃ ┃ ┃ ┗ persistence
 ┃ ┃ ┃ ┃ ┣ entities
 ┃ ┃ ┃ ┃ ┣ mappers
 ┃ ┃ ┃ ┃ ┣ repositories
 ┃ ┃ ┃ ┃ ┗ transformers
 ┃ ┣ common
 ┃ ┃ ┣ decorators
 ┃ ┃ ┣ guards
 ┃ ┃ ┗ strategies
 ┃ ┗ dtos
 ┃ ┃ ┣ request
 ┃ ┃ ┗ response
 ┣ test
 ┗ README.md
```

## 2. 인증 흐름

### 2.1 로그인 흐름

1. 사용자가 이메일/비밀번호로 로그인 요청
2. LoginUseCase에서 사용자 정보 확인 및 비밀번호 검증
3. 액세스 토큰과 리프레시 토큰 생성
4. 리프레시 토큰 해시를 사용자 테이블에 저장
5. 리프레시 토큰을 HTTP-Only 쿠키에 설정
6. 액세스 토큰과 사용자 정보 응답으로 반환

### 2.2 토큰 갱신 흐름

1. 액세스 토큰 만료 시 리프레시 토큰으로 갱신 요청
2. RefreshTokenUseCase에서 리프레시 토큰 검증
3. 사용자 테이블에서 저장된 토큰 해시와 비교 검증
4. 기존 리프레시 토큰 해시를 무효화 (사용자 테이블에서 null로 설정)
5. 새 액세스 토큰과 리프레시 토큰 발급
6. 새 리프레시 토큰 해시를 사용자 테이블에 저장
7. 새 리프레시 토큰을 HTTP-Only 쿠키에 설정
8. 새 액세스 토큰 응답으로 반환

### 2.3 로그아웃 흐름

1. 사용자가 로그아웃 요청
2. LogoutUseCase에서 토큰 무효화 처리
3. 사용자 테이블에서 리프레시 토큰 해시를 null로 설정
4. 클라이언트에서 쿠키 삭제 및 메모리에서 액세스 토큰 제거

## 3. 핵심 컴포넌트

### 3.1 사용자 테이블 변경

기존 사용자 테이블에 다음 필드를 추가합니다:

```sql
ALTER TABLE USERS ADD (
    refresh_token_hash VARCHAR2(255) NULL,
    refresh_token_expires_at TIMESTAMP NULL
);
```

### 3.2 주요 인터페이스 (포트)

**입력 포트 (유스케이스):**

- `LoginPort`: 로그인 처리
- `RefreshTokenPort`: 토큰 갱신
- `LogoutPort`: 로그아웃 처리

**출력 포트 (인프라):**

- `TokenServicePort`: 토큰 생성 및 검증
- `PasswordServicePort`: 비밀번호 검증
- `UserRepositoryPort`: 사용자 데이터 접근

### 3.3 인증 가드

- `JwtAuthGuard`: JWT 기반 인증 검증
- `RolesGuard`: 역할 기반 인가
- `PermissionGuard`: 권한 기반 인가

## 4. 구현 상세

### 4.1 토큰 서비스

```typescript
@Injectable()
export class JwtTokenService implements TokenServicePort {
  constructor(
    private readonly jwtService: JwtService,
    @Inject("USER_REPOSITORY") private readonly userRepository: UserRepositoryPort,
  ) {}

  generateAccessToken(user: User): string {
    const jti = uuidv4()
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      jti,
    }

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: "1h",
    })
  }

  async generateRefreshToken(user: User): Promise<string> {
    const jti = uuidv4()
    const expiresIn = 7 * 24 * 60 * 60 // 7일

    const payload = {
      sub: user.id,
      jti,
    }

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: `${expiresIn}s`,
    })

    // 리프레시 토큰 해시 생성
    const tokenHash = this.hashToken(token)

    // 사용자 테이블에 리프레시 토큰 해시 저장
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn)

    await this.userRepository.updateRefreshToken(user.id, tokenHash, expiresAt)

    return token
  }

  // ... 다른 메서드 ...

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex")
  }
}
```

### 4.2 사용자 저장소

```typescript
@Injectable()
export class TypeOrmUserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  // ... 다른 메서드 ...

  async updateRefreshToken(userId: string, tokenHash: string | null, expiresAt: Date | null): Promise<void> {
    await this.userRepository.update(
      { user_id: userId },
      {
        refresh_token_hash: tokenHash,
        refresh_token_expires_at: expiresAt,
        updated_at: new Date(),
      },
    )
  }
}
```

### 4.3 로그인 유스케이스

```typescript
@Injectable()
export class LoginUseCase implements LoginPort {
  constructor(
    @Inject("USER_REPOSITORY") private readonly userRepository: UserRepositoryPort,
    @Inject("PASSWORD_SERVICE") private readonly passwordService: PasswordServicePort,
    @Inject("TOKEN_SERVICE") private readonly tokenService: TokenServicePort,
  ) {}

  async execute(request: LoginRequestDto): Promise<LoginResponseDto> {
    try {
      // 이메일로 사용자 조회
      const user = await this.userRepository.findByEmail(request.email)
      if (!user) {
        return LoginResponseDto.failure("Invalid email or password")
      }

      // 비밀번호 확인
      const isPasswordValid = await this.passwordService.comparePassword(request.password, user.passwordHash)

      if (!isPasswordValid) {
        return LoginResponseDto.failure("Invalid email or password")
      }

      // 토큰 생성
      const accessToken = this.tokenService.generateAccessToken(user)
      const refreshToken = await this.tokenService.generateRefreshToken(user)

      // 로그인 이력 업데이트
      await this.userRepository.updateLastLogin(user.id)

      return LoginResponseDto.success(accessToken, refreshToken, user.role, {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      })
    } catch (error) {
      console.error("Login error:", error)
      return LoginResponseDto.failure("An error occurred during login")
    }
  }
}
```

### 4.4 토큰 갱신 유스케이스

```typescript
@Injectable()
export class RefreshTokenUseCase implements RefreshTokenPort {
  constructor(@Inject("TOKEN_SERVICE") private readonly tokenService: TokenServicePort) {}

  async execute(request: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto> {
    try {
      // 토큰 갱신
      const { accessToken, refreshToken } = await this.tokenService.refreshTokens(request.refreshToken)

      return RefreshTokenResponseDto.success(accessToken, refreshToken)
    } catch (error) {
      console.error("Token refresh error:", error)
      return RefreshTokenResponseDto.failure("Invalid refresh token")
    }
  }
}
```

### 4.5 로그아웃 유스케이스

```typescript
@Injectable()
export class LogoutUseCase implements LogoutPort {
  constructor(@Inject("TOKEN_SERVICE") private readonly tokenService: TokenServicePort) {}

  async execute(request: LogoutRequestDto): Promise<LogoutResponseDto> {
    try {
      // 토큰 무효화 (리프레시 토큰 해시 초기화)
      await this.tokenService.invalidateTokens(request.accessToken, request.refreshToken)

      return LogoutResponseDto.success()
    } catch (error) {
      console.error("Logout error:", error)
      return LogoutResponseDto.failure("An error occurred during logout")
    }
  }
}
```

## 5. 보안 고려사항

### 5.1 토큰 보안

- 액세스 토큰은 짧은 만료 시간(1시간)을 가짐
- 리프레시 토큰은 HTTP-Only + Secure + SameSite=Strict 쿠키로 보호
- 리프레시 토큰은 일회용으로 사용됨 (토큰 교체 패턴)
- 리프레시 토큰의 해시값만 서버에 저장하여 원본 토큰은 저장하지 않음
- 로그아웃 시 리프레시 토큰 해시를 사용자 테이블에서 null로 설정하여 재사용 방지

### 5.2 CSRF 방어

- 액세스 토큰은 메모리에만 저장되므로 CSRF 공격에 안전
- 리프레시 토큰은 HTTP-Only, SameSite=Strict 쿠키에 저장하여 CSRF 공격으로부터 보호
- 사용자 테이블에 저장된 토큰 해시와 비교 검증하여 추가 보안층 제공

### 5.3 보안 헤더

- `Strict-Transport-Security`: HTTPS 강제
- `X-Content-Type-Options`: MIME 스니핑 방지
- `X-Frame-Options`: 클릭재킹 방지
- `X-XSS-Protection`: XSS 방지
- `Referrer-Policy`: 리퍼러 정보 제한

## 6. 향후 개선 계획

### 6.1 Redis 도입 (선택 사항)

향후 성능 개선과 확장성을 위해 Redis를 도입할 수 있습니다:

1. **토큰 블랙리스트 관리**:

   - 로그아웃한 액세스 토큰을 블랙리스트에 추가하여 토큰 만료 이전에도 무효화 가능
   - 현재는 리프레시 토큰만 무효화하고 있어 액세스 토큰은 만료될 때까지 유효함

2. **세션 정보 캐싱**:

   - 사용자 권한 정보 등 자주 조회되는 데이터 캐싱
   - 데이터베이스 부하 감소 및 응답 시간 개선

3. **분산 환경 지원**:
   - 여러 서버 인스턴스 간 인증 정보 공유
   - 무상태성 강화

### 6.2 추가 기능

1. **소셜 로그인 통합**:

   - Google, Kakao, Naver, GitHub 소셜 로그인 구현
   - 기존 사용자와 소셜 계정 연동

2. **다중 기기 지원**:

   - 기기별 리프레시 토큰 관리
   - 특정 기기만 로그아웃할 수 있는 기능

3. **보안 로깅 강화**:
   - 인증 시도 및 토큰 사용 로깅
   - 이상 패턴 감지 및 알림

## 7. 결론

이 구현 방식은 Redis와 같은 추가 인프라 없이도 안전한 인증 시스템을 제공합니다. 액세스 토큰의 메모리 저장과 리프레시 토큰의 HTTP-Only 쿠키 저장은 CSRF 공격에 대한 방어를 제공하며, 사용자 테이블에 리프레시 토큰 해시를 저장함으로써 토큰 재사용 방지 및 검증이 가능합니다.

향후 시스템 규모 확장과 기능 추가에 따라 Redis를 도입하여 캐싱, 블랙리스트 관리, 분산 환경 지원 등을 강화할 수 있습니다.
