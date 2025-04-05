# 코테피티 세션 관리 가이드

이 문서는 코테피티(Cotept) 서비스의 세션 관리 및 Redis 활용 방안에 대해 설명합니다.

## 1. Redis 기반 세션 관리 전략

코테피티 서비스는 Redis를 세션 스토리지로 활용해 다음과 같은 데이터를 관리합니다:

### 1.1 토큰 관리

```
// 토큰 블랙리스트 (로그아웃된 토큰)
KEY: "blacklist:token:{jti}"
VALUE: 1
EXPIRY: 액세스 토큰의 만료 시간과 동일

// 리프레시 토큰 추적
KEY: "refresh_token:{token_id}"
VALUE: { userId: "user123", issuedAt: "timestamp", device: "browser/chrome" }
EXPIRY: 리프레시 토큰 만료 시간과 동일
```

### 1.2 사용자 세션 정보

```
// 사용자 세션
KEY: "session:user:{userId}"
VALUE: { 
  id: "user123", 
  role: "MENTOR", 
  permissions: ["session:create", "session:join"],
  lastActive: "timestamp"
}
EXPIRY: 세션 활성화 기간 (예: 24시간)
```

### 1.3 사용자별 활성 세션 인덱스

```
// 사용자별 활성 세션 목록
KEY: "user_sessions:{userId}"
VALUE: SET ["session1", "session2", "session3"]
EXPIRY: 없음 (관리 로직에 의해 추가/제거)
```

## 2. Redis 연결 및 모듈 구성

### 2.1 Redis 모듈 구현

```typescript
// src/modules/shared/redis/redis.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD', ''),
          keyPrefix: 'cotept:',
          retryStrategy: (times) => Math.min(times * 50, 2000),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
```

### 2.2 세션 관리 서비스

```typescript
// src/modules/auth/infrastructure/service/session.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class SessionService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  // 사용자 세션 저장
  async storeUserSession(userId: string, sessionData: any, ttl: number = 86400): Promise<void> {
    const key = `session:user:${userId}`;
    await this.redis.set(key, JSON.stringify(sessionData), 'EX', ttl);
    
    // 사용자의 활성 세션 목록에 추가
    await this.redis.sadd(`user_sessions:${userId}`, key);
  }

  // 사용자 세션 조회
  async getUserSession(userId: string): Promise<any | null> {
    const key = `session:user:${userId}`;
    const data = await this.redis.get(key);
    
    if (!data) return null;
    return JSON.parse(data);
  }

  // 사용자 세션 삭제 (로그아웃)
  async removeUserSession(userId: string): Promise<void> {
    const key = `session:user:${userId}`;
    await this.redis.del(key);
    
    // 사용자의 활성 세션 목록에서 제거
    await this.redis.srem(`user_sessions:${userId}`, key);
  }

  // 토큰 블랙리스트 추가
  async addToBlacklist(jti: string, expiresIn: number): Promise<void> {
    await this.redis.set(`blacklist:token:${jti}`, '1', 'EX', expiresIn);
  }

  // 토큰 블랙리스트 확인
  async isBlacklisted(jti: string): Promise<boolean> {
    const exists = await this.redis.exists(`blacklist:token:${jti}`);
    return exists === 1;
  }

  // 리프레시 토큰 저장
  async storeRefreshToken(tokenId: string, userId: string, metadata: any, ttl: number): Promise<void> {
    const data = {
      userId,
      issuedAt: new Date().toISOString(),
      ...metadata,
    };
    
    await this.redis.set(`refresh_token:${tokenId}`, JSON.stringify(data), 'EX', ttl);
  }

  // 리프레시 토큰 검증
  async validateRefreshToken(tokenId: string, userId: string): Promise<boolean> {
    const data = await this.redis.get(`refresh_token:${tokenId}`);
    if (!data) return false;
    
    const parsed = JSON.parse(data);
    return parsed.userId === userId;
  }

  // 리프레시 토큰 삭제
  async removeRefreshToken(tokenId: string): Promise<void> {
    await this.redis.del(`refresh_token:${tokenId}`);
  }

  // 사용자의 모든 세션 삭제 (강제 로그아웃)
  async removeAllUserSessions(userId: string): Promise<void> {
    const sessionKeys = await this.redis.smembers(`user_sessions:${userId}`);
    
    if (sessionKeys.length > 0) {
      // 모든 세션 삭제
      await this.redis.del(...sessionKeys);
    }
    
    // 세션 인덱스 삭제
    await this.redis.del(`user_sessions:${userId}`);
  }
}
```

## 3. DDD와 어니언 아키텍처 적용

Redis 서비스는 인프라스트럭처 레이어에 구현하고, 애플리케이션 레이어에서는 인터페이스를 통해 접근합니다:

### 3.1 출력 포트 정의 (Application Layer)

```typescript
// src/modules/auth/application/port/output/session-storage.port.ts
export interface ISessionStorage {
  storeUserSession(userId: string, sessionData: any, ttl?: number): Promise<void>;
  getUserSession(userId: string): Promise<any | null>;
  removeUserSession(userId: string): Promise<void>;
  addToBlacklist(jti: string, expiresIn: number): Promise<void>;
  isBlacklisted(jti: string): Promise<boolean>;
  storeRefreshToken(tokenId: string, userId: string, metadata: any, ttl: number): Promise<void>;
  validateRefreshToken(tokenId: string, userId: string): Promise<boolean>;
  removeRefreshToken(tokenId: string): Promise<void>;
  removeAllUserSessions(userId: string): Promise<void>;
}
```

### 3.2 Redis 어댑터 구현 (Infrastructure Layer)

```typescript
// src/modules/auth/infrastructure/adapter/redis-session.adapter.ts
import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ISessionStorage } from '../../application/port/output/session-storage.port';

@Injectable()
export class RedisSessionAdapter implements ISessionStorage {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  // ISessionStorage 인터페이스 구현
  // (위의 SessionService 코드와 동일한 구현)
}
```

## 4. JWT 토큰 관리와 Redis 통합

### 4.1 토큰 생성 및 검증

```typescript
// src/modules/auth/application/service/token.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { ISessionStorage } from '../port/output/session-storage.port';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionStorage: ISessionStorage,
  ) {}

  // 액세스 토큰 생성
  async generateAccessToken(payload: any): Promise<string> {
    const jti = uuidv4();
    const token = this.jwtService.sign(
      {
        ...payload,
        jti,
      },
      {
        expiresIn: '1h', // 1시간
      },
    );
    
    return token;
  }

  // 리프레시 토큰 생성
  async generateRefreshToken(userId: string, metadata: any = {}): Promise<string> {
    const jti = uuidv4();
    const expiresIn = 7 * 24 * 60 * 60; // 7일
    
    const token = this.jwtService.sign(
      {
        sub: userId,
        jti,
      },
      {
        expiresIn: `${expiresIn}s`,
      },
    );
    
    // Redis에 리프레시 토큰 저장
    await this.sessionStorage.storeRefreshToken(jti, userId, metadata, expiresIn);
    
    return token;
  }

  // 액세스 토큰 검증
  async validateAccessToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      
      // 토큰이 블랙리스트에 있는지 확인
      const isBlacklisted = await this.sessionStorage.isBlacklisted(payload.jti);
      if (isBlacklisted) {
        throw new Error('Token is blacklisted');
      }
      
      return payload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // 리프레시 토큰 검증 및 새 토큰 발급
  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const { sub: userId, jti } = payload;
      
      // Redis에서 리프레시 토큰 검증
      const isValid = await this.sessionStorage.validateRefreshToken(jti, userId);
      if (!isValid) {
        throw new Error('Invalid refresh token');
      }
      
      // 기존 리프레시 토큰 삭제 (일회용)
      await this.sessionStorage.removeRefreshToken(jti);
      
      // 새 토큰 발급
      const newAccessToken = await this.generateAccessToken({ sub: userId });
      const newRefreshToken = await this.generateRefreshToken(userId);
      
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // 토큰 무효화 (로그아웃)
  async invalidateTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      // 액세스 토큰 페이로드 추출
      const accessPayload = this.jwtService.decode(accessToken);
      if (accessPayload && typeof accessPayload === 'object') {
        // 액세스 토큰 블랙리스트에 추가
        const expiryTime = accessPayload.exp - Math.floor(Date.now() / 1000);
        if (expiryTime > 0) {
          await this.sessionStorage.addToBlacklist(accessPayload.jti, expiryTime);
        }
      }
      
      // 리프레시 토큰 페이로드 추출
      const refreshPayload = this.jwtService.decode(refreshToken);
      if (refreshPayload && typeof refreshPayload === 'object') {
        // 리프레시 토큰 삭제
        await this.sessionStorage.removeRefreshToken(refreshPayload.jti);
      }
    } catch (error) {
      // 오류가 발생해도 계속 진행 (best effort)
      console.error('Error during token invalidation:', error);
    }
  }
}
```

### 4.2 세션 및 권한 관리

```typescript
// src/modules/auth/application/service/session-manager.service.ts
import { Injectable } from '@nestjs/common';
import { ISessionStorage } from '../port/output/session-storage.port';
import { UserRepository } from '../port/output/user-repository.port';

@Injectable()
export class SessionManagerService {
  constructor(
    private readonly sessionStorage: ISessionStorage,
    private readonly userRepository: UserRepository,
  ) {}

  // 사용자 세션 생성/갱신
  async createUserSession(userId: string): Promise<any> {
    // 사용자 정보 조회
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // 권한 정보 생성
    const sessionData = {
      id: user.id,
      role: user.role,
      permissions: this.getPermissionsByRole(user.role),
      lastActive: new Date().toISOString(),
    };
    
    // Redis에 세션 저장
    await this.sessionStorage.storeUserSession(userId, sessionData);
    
    return sessionData;
  }

  // 사용자 세션 조회
  async getUserSession(userId: string): Promise<any> {
    const session = await this.sessionStorage.getUserSession(userId);
    
    // 세션이 없으면 새로 생성
    if (!session) {
      return this.createUserSession(userId);
    }
    
    return session;
  }

  // 역할별 권한 매핑
  private getPermissionsByRole(role: string): string[] {
    switch (role) {
      case 'ADMIN':
        return [
          'user:read',
          'user:write',
          'mentoring:read',
          'mentoring:write',
          'admin:access',
        ];
      case 'MENTOR':
        return [
          'user:read',
          'mentoring:read',
          'mentoring:write',
          'session:create',
          'session:join',
        ];
      case 'MENTEE':
        return [
          'user:read',
          'mentoring:read',
          'session:join',
        ];
      default:
        return ['user:read'];
    }
  }

  // 세션 종료 (로그아웃)
  async terminateSession(userId: string): Promise<void> {
    await this.sessionStorage.removeUserSession(userId);
  }

  // 모든 세션 종료 (비밀번호 변경 등에서 사용)
  async terminateAllSessions(userId: string): Promise<void> {
    await this.sessionStorage.removeAllUserSessions(userId);
  }
}
```

## 5. 실제 구현 가이드

### 5.1 구현 단계

1. Redis 모듈 구현 및 설정
2. 세션 스토리지 인터페이스 정의
3. Redis 어댑터 구현
4. 토큰 서비스 및 세션 관리 서비스 구현
5. 인증 가드 및 컨트롤러 연동

### 5.2 설정 및 환경 변수

`.env` 파일에 다음 환경 변수를 추가합니다:

```
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
```

### 5.3 모듈 등록

`auth.module.ts`에 다음과 같이 등록합니다:

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '../shared/redis/redis.module';
import { TokenService } from './application/service/token.service';
import { SessionManagerService } from './application/service/session-manager.service';
import { RedisSessionAdapter } from './infrastructure/adapter/redis-session.adapter';

@Module({
  imports: [
    RedisModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [
    TokenService,
    SessionManagerService,
    {
      provide: 'ISessionStorage',
      useClass: RedisSessionAdapter,
    },
  ],
  exports: [
    TokenService,
    SessionManagerService,
  ],
})
export class AuthModule {}
```

이러한 구현을 통해 액세스 토큰과 리프레시 토큰을 사용한 인증 시스템을 Redis와 함께 효과적으로 관리할 수 있습니다.
