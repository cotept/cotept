백준 모듈 구현 마스터 플랜 기반으로 Phase 3 (Infrastructure Layer) 구현을 이어가겠습니다.

현재 완료 상태:
✅ Phase 1: Domain Layer (완료)
✅ Phase 2: Application Layer (완료)
🔄 Phase 3: Infrastructure Layer (시작 예정)

user 모듈(/home/hyun95/development/projects/cote_pt_2024/cotept/apps/api/src/modules/user) 패턴을 참고해서 다음을 구현해주세요.

1. External API 어댑터 (solved.ac HTTP 클라이언트)
2. Persistence 어댑터 (NoSQL 레포지토리)
3. Controllers & API (REST 엔드포인트)

주의사항

1. 기존 shared 모듈과 user 모듈의 infrastructure 패턴을 따르고, YAGNI, KISS, DRY, SOLID 원칙을 지켜주세요.
2. 작업 전에 꼭 모든 파일을 확인하세요 /home/hyun95/development/projects/cote_pt_2024/cotept/apps/api/src/modules/baekjoon
3. 도메인 레이어의 모델 파일은 _.model.ts를 붙이고, persistence의 엔티티 파일은 _.entities.ts 붙여주세요.
4. DTO 파일은 모두 class-transformer,class-validator,@nestjs/swagger를 사용해주세요.
5. mapper 파일은 class-transformer 활용해주세요.
6. controller 파일에 적극적으로 @nest/swagger 적용해주세요.
7. 커맨트 쿼리 패턴을 사용하지 말아주세요.
8. port 랑 usecase 모두 클래스로 만들어야 합니다.
9. 임포트 경로는 @로 시작하도록 작성해주세요.
10. 모든 파일을 CRUD 할 때 어떤 파일을 기반으로 판단했는 지 그리고 어떻게 작업할 건 지 간단하게 저에게 설명 후 제 허락을 받고 작업해주세요.

작업 경로: /home/hyun95/development/projects/cote_pt_2024/cotept/apps/api/src/modules/baekjoon

# 백준 모듈 구현 마스터 플랜

## 📋 프로젝트 개요

**목표**: solved.ac API를 활용한 백준 ID 인증 시스템 구현
**아키텍처**: 헥사고날 아키텍처 (기존 user 모듈 패턴 따름)
**원칙**: YAGNI, KISS, DRY, SOLID

## 🔄 인증 프로세스

### 변경된 인증 방식

- ❌ ~~문제 풀기 인증~~ → ✅ **프로필 name(additional_info의 nameNative) 수정 인증**
- 사용자가 solved.ac 프로필 name(additional_info의 nameNative)를 랜덤 문자열로 수정
- 서버가 API로 name(additional_info의 nameNative) 확인하여 인증 완료

### 인증 플로우

1. 사용자가 백준 ID 입력
2. 서버가 랜덤 문자열 생성 (예: "배부른고양이847293")
3. 사용자가 solved.ac 프로필 name(additional_info의 nameNative) 수정
4. 사용자가 "인증하기" 버튼 클릭
5. 서버가 `/user/additional_info` API로 name(additional_info의 nameNative) 확인
6. 문자열 일치하면 인증 완료

## 🌐 solved.ac API 엔드포인트

### 1. 사용자 프로필 조회 (캐싱 O)

```
GET https://solved.ac/api/v3/user/show?handle={userId}
응답: UserProfile (tier, rating, solvedCount 등)
```

### 2. 사용자 태그 통계 조회 (캐싱 O)

```
GET https://solved.ac/api/v3/user/tag_ratings?handle={userId}
응답: BojTag[] (태그별 해결 문제 수, 레이팅 등)
```

### 3. 사용자 부가 정보 조회 (캐싱 X - 인증용)

```
GET https://solved.ac/api/v3/user/additional_info?handle={userId}
응답: { name(additional_info의 nameNative): string, ... } (인증 문자열 확인용)
```

## 📁 폴더 구조 (user 모듈 패턴)

```
src/modules/baekjoon/
├── application/
│   ├── dtos/                                  # 애플리케이션 DTO
│   │   ├── baekjoon-profile.dto.ts
│   │   ├── start-verification.dto.ts
│   │   ├── complete-verification.dto.ts
│   │   ├── verification-status.dto.ts
│   │   ├── tag-statistics.dto.ts
│   │   └── index.ts
│   ├── mappers/                               # 애플리케이션 매퍼
│   │   ├── __tests__/
│   │   │   └── baekjoon.mapper.spec.ts
│   │   └── baekjoon.mapper.ts
│   ├── ports/                                 # 포트 인터페이스
│   │   ├── in/                               # 인바운드 포트
│   │   │   ├── start-verification.usecase.ts
│   │   │   ├── complete-verification.usecase.ts
│   │   │   ├── get-profile.usecase.ts
│   │   │   ├── get-statistics.usecase.ts
│   │   │   └── index.ts
│   │   └── out/                              # 아웃바운드 포트
│   │       ├── solved-ac-api.port.ts
│   │       ├── baekjoon-repository.port.ts
│   │       ├── cache.port.ts
│   │       ├── rate-limit.port.ts
│   │       └── index.ts
│   └── services/                             # 애플리케이션 서비스
│       ├── facade/
│       │   ├── __tests__/
│       │   │   └── baekjoon-facade.service.spec.ts
│       │   ├── baekjoon-facade.service.ts
│       │   └── index.ts
│       ├── usecases/                         # 유스케이스 구현
│       │   ├── __tests__/
│       │   │   ├── start-verification.usecase.impl.spec.ts
│       │   │   ├── complete-verification.usecase.impl.spec.ts
│       │   │   ├── get-profile.usecase.impl.spec.ts
│       │   │   └── get-statistics.usecase.impl.spec.ts
│       │   ├── start-verification.usecase.impl.ts
│       │   ├── complete-verification.usecase.impl.ts
│       │   ├── get-profile.usecase.impl.ts
│       │   ├── get-statistics.usecase.impl.ts
│       │   └── index.ts
│       └── index.ts
├── domain/                                   # 도메인 계층
│   ├── model/                               # 도메인 엔티티
│   │   ├── __tests__/
│   │   │   ├── baekjoon-user.model.spec.ts
│   │   │   └── verification-session.model.spec.ts
│   │   ├── baekjoon-user.model.ts
│   │   └── verification-session.model.ts
│   └── vo/                                  # 값 객체
│       ├── __tests__/
│       │   ├── baekjoon-handle.vo.spec.ts
│       │   ├── verification-string.vo.spec.ts
│       │   ├── verification-status.vo.spec.ts
│       │   └── tier.vo.spec.ts
│       ├── baekjoon-handle.vo.ts
│       ├── verification-string.vo.ts
│       ├── verification-status.vo.ts
│       └── tier.vo.ts
├── infrastructure/                          # 인프라스트럭처 계층
│   ├── adapter/
│   │   ├── in/                             # 인바운드 어댑터
│   │   │   ├── controllers/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── baekjoon.controller.spec.ts
│   │   │   │   ├── baekjoon.controller.ts
│   │   │   │   └── index.ts
│   │   │   └── mappers/
│   │   │       ├── baekjoon-request.mapper.ts
│   │   │       └── index.ts
│   │   └── out/                            # 아웃바운드 어댑터
│   │       ├── external/                   # 외부 API
│   │       │   ├── solved-ac-api.adapter.ts
│   │       │   ├── solved-ac-http.client.ts
│   │       │   └── index.ts
│   │       ├── persistence/                # 영속성
│   │       │   ├── entities/
│   │       │   │   ├── baekjoon-profile.nosql.entity.ts
│   │       │   │   ├── verification-session.nosql.entity.ts
│   │       │   │   └── index.ts
│   │       │   ├── mappers/
│   │       │   │   ├── baekjoon-persistence.mapper.ts
│   │       │   │   └── index.ts
│   │       │   └── repositories/
│   │       │       ├── __tests__/
│   │       │       │   └── nosql-baekjoon.repository.spec.ts
│   │       │       ├── nosql-baekjoon.repository.ts
│   │       │       └── index.ts
│   │       └── services/                   # 외부 서비스
│   │           ├── cache/
│   │           │   ├── baekjoon-cache.service.ts
│   │           │   └── index.ts
│   │           ├── rate-limit/
│   │           │   ├── baekjoon-rate-limit.service.ts
│   │           │   └── index.ts
│   │           └── index.ts
│   ├── common/                             # 공통 요소
│   │   ├── decorators/
│   │   ├── guards/
│   │   └── strategies/
│   └── dtos/                               # 인프라 DTO
│       ├── request/
│       │   ├── start-verification.request.dto.ts
│       │   ├── complete-verification.request.dto.ts
│       │   └── get-profile.request.dto.ts
│       └── response/
│           ├── verification-status.response.dto.ts
│           ├── baekjoon-profile.response.dto.ts
│           ├── tag-statistics.response.dto.ts
│           └── verification-result.response.dto.ts
└── baekjoon.module.ts                      # 모듈 정의
```

## 💾 데이터 저장 전략

### Oracle NoSQL DB 활용

- **기존 베이스**: `shared/infrastructure/persistence/nosql/` 활용
- **테이블 3개**:
  1. `baekjoon_profiles` - 사용자 프로필 (45분 캐싱)
  2. `baekjoon_tag_statistics` - 태그 통계 (45분 캐싱)
  3. `verification_sessions` - 인증 세션 (1시간 TTL)

### Redis 캐싱

- **기존 모듈**: `shared/infrastructure/cache/redis/` 활용
- **캐싱 전략**: 일반 조회는 캐싱, 인증용 API는 캐시 우회

## 🔒 보안 및 제한

### Rate Limiting (Redis 기반)

- **사용자별**: 30분/1회 API 호출 제한
- **식별자**: IP + UserAgent + AccessToken 해시
- **예외**: 인증용 API는 별도 제한

### 에러 처리

/home/hyun95/development/projects/cote_pt_2024/cotept/apps/api/src/shared/utils/error.util.ts 를 사용하고
@nest/common logger를 사용하여 다음과 같이 로깅한다

```typescript
this.logger.error(
  `baekjoon.service.${클래스.name}\n${ErrorUtils.getErrorMessage(error)}\n\n${ErrorUtils.getErrorStack(error)}`,
)
throw new 상황에 맞는 Exception("에러 메세지")

```

### 랜덤 문자열 생성

```typescript
// 기본: 6자리 숫자로 유일성 보장 (900,000개 조합)
"배부른고양이847293"

// 강화: 타임스탬프 + 랜덤 (8자리)
"귀여운토끼17398452"

// 최고: UUID 기반 (8자리)
"똑똑한강아지83749201"
```

### 중복 방지

- 현재 활성 인증 문자열 체크
- 중복 발견 시 자동으로 다른 방식 사용
- 유사도 검사로 오타 힌트 제공

## 🛠️ 기술 스택

### HTTP Client (시니어 레벨 Axios)

```typescript
// 활용 기능
- AbortController (요청 취소)
- Request/Response 인터셉터
- 재시도 로직 (1회)
- 타입 안전성
- 에러 변환
```

### 에러 처리

```typescript
// 활용 유틸리티
import { ErrorUtils } from "@/shared/utils/error.util"

// 커스텀 예외들
;-BaekjoonIdNotFoundException(404) -
  VerificationAlreadyInProgressException(409) -
  SolvedAcApiException(503) -
  RateLimitExceededException(429)
```

### 의존성 주입

```typescript
// 기존 shared 모듈 활용
import { CacheService } from "@/shared/infrastructure/cache/redis"
import { BaseNoSqlRepository } from "@/shared/infrastructure/persistence/nosql"
import { ApiErrorFilter } from "@/shared/infrastructure/common/filters"
```

## 🚀 구현 순서

### Phase 1: Domain Core (1일)

1. **Value Objects**:
   - `BaekjoonHandle`, `VerificationString`, `VerificationStatus`, `Tier`
2. **Entities**:
   - `BaekjoonUser`, `VerificationSession`

### Phase 2: Application Layer (1일)

1. **Ports (인터페이스)**:
   - Inbound: 4개 UseCase 인터페이스
   - Outbound: 4개 포트 인터페이스
2. **DTOs**: 애플리케이션 내부 DTO들
3. **Mappers**: 도메인 ↔ DTO 변환

### Phase 3: Use Cases (1-2일)

1. **Start Verification**: 랜덤 문자열 생성, 세션 저장
2. **Complete Verification**: name(additional_info의 nameNative) 확인, 인증 완료
3. **Get Profile**: 프로필 조회 (캐싱 적용)
4. **Get Statistics**: 태그 통계 조회 (캐싱 적용)

### Phase 4: Infrastructure Adapters (2-3일)

1. **External API**: solved.ac HTTP 클라이언트
2. **Persistence**: NoSQL 레포지토리 (기존 베이스 활용)
3. **Cache**: Redis 캐시 서비스 (기존 모듈 활용)
4. **Rate Limit**: 사용자별 제한 서비스

### Phase 5: Controllers & Integration (1일)

1. **REST API**: 백준 컨트롤러
2. **Request/Response DTOs**: API 스펙 정의
3. **모듈 통합**: 의존성 주입 설정
4. **테스트**: 핵심 기능 테스트

## 🔄 다음 대화에서 이어가기

새로운 대화에서는 이 문서를 참조하여:

1. **"이 마스터 플랜 기반으로 백준 모듈 구현을 이어가겠습니다"**
2. **구현하고 싶은 Phase 번호 언급**
3. **기존 user 모듈 패턴 참조 요청**
4. **YAGNI, KISS, DRY, SOLID 원칙 강조**

이렇게 하면 컨텍스트 없이도 바로 구현을 이어갈 수 있습니다! 🎯
