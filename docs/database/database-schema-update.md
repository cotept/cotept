# 리프레시 토큰 관리를 위한 데이터베이스 스키마 업데이트

코테피티 서비스의 인증 시스템 변경에 따라 사용자 테이블에 다음과 같은 필드를 추가해야 합니다.

## USERS 테이블 변경

```sql
-- USERS 테이블에 리프레시 토큰 관련 필드 추가
ALTER TABLE USERS ADD (
    refresh_token_hash VARCHAR2(255) NULL,
    refresh_token_expires_at TIMESTAMP NULL
);

-- 인덱스 추가 (선택 사항)
CREATE INDEX idx_users_refresh_token ON USERS(refresh_token_hash);
```

## 변경 이유

1. **리프레시 토큰 저장**: 사용자별로 발급된 리프레시 토큰의 해시값을 저장합니다. 액세스 토큰 갱신 요청 시 이 해시값을 검증하여 유효한 리프레시 토큰인지 확인합니다.

2. **만료 시간 관리**: 리프레시 토큰의 만료 시간을 저장하여, 만료된 토큰의 사용을 방지합니다.

3. **보안 강화**: 리프레시 토큰 해시를 저장함으로써 서버 측에서 토큰 유효성을 추가로 검증할 수 있습니다. 이는 토큰 탈취 시 보안 위험을 줄이는 데 도움이 됩니다.

4. **로그아웃 지원**: 사용자가 로그아웃할 때 리프레시 토큰 해시를 null로 설정하여 토큰을 무효화할 수 있습니다.

## 적용 방법

1. 개발 환경에서 위 SQL 스크립트를 실행하여 테이블 변경

2. 마이그레이션 스크립트에 추가하여 다른 환경에도 적용

## 관련 코드 변경

1. `User` 도메인 모델에 `refreshTokenHash`와 `refreshTokenExpiresAt` 필드 추가
2. `UserEntity` ORM 매핑 클래스에 해당 필드 추가
3. `UserRepositoryPort` 인터페이스에 `updateRefreshToken` 메서드 추가
4. `TypeOrmUserRepository`에 해당 메서드 구현
5. `TokenService`에서 리프레시 토큰 생성 및 검증 로직 수정
