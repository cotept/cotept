# 백준 모듈 API 실행 플로우

## 📋 개요

백준 모듈의 각 엔드포인트별 상세 실행 플로우를 정리한 문서입니다.

---

## 🔐 1. POST `/baekjoon/verification/start` - 인증 시작

### 📥 **Request Flow**

```
1. BaekjoonController.startVerification()
   ├── @Body() StartVerificationRequestDto
   └── BaekjoonRequestMapper.toStartVerificationInput()
       └── StartVerificationInputDto 생성

2. BaekjoonFacadeService.startVerification()
   └── StartVerificationUseCaseImpl.execute()
       ├── 1단계: 입력값 검증
       │   └── BaekjoonUser.validateUserIdAndHandle()
       ├── 2단계: 기존 사용자 조회
       │   └── BaekjoonProfileRepository.findByUserId()
       ├── 3단계: 활성 세션 확인
       │   └── BaekjoonCacheService.getVerificationSession()
       ├── 4단계: solved.ac API 호출
       │   └── SolvedAcApiAdapter.getUserProfile()
       │       └── SolvedAcHttpClient.get()
       ├── 5단계: 인증 세션 생성
       │   ├── VerificationSession.create()
       │   ├── VerificationString.generate()
       │   └── BaekjoonCacheService.setVerificationSession()
       └── 6단계: 응답 데이터 변환
           └── BaekjoonResponseMapper.toStartVerificationOutput()
```

### 🎯 **핵심 비즈니스 로직**

- 백준 ID 유효성 검증
- 중복 인증 세션 방지
- solved.ac API를 통한 사용자 존재 확인
- 랜덤 인증 문자열 생성 (예: "배부른고양이847293")
- Redis 캐시에 1시간 TTL로 세션 저장

### 📤 **Response**: `VerificationStatusResponseDto`

---

## ✅ 2. POST `/baekjoon/verification/complete` - 인증 완료

### 📥 **Request Flow**

```
1. BaekjoonController.completeVerification()
   ├── @UseGuards(JwtAuthGuard) - JWT 인증 필요
   ├── @Body() CompleteVerificationRequestDto
   └── BaekjoonRequestMapper.toCompleteVerificationInput()

2. BaekjoonFacadeService.completeVerification()
   └── CompleteVerificationUseCaseImpl.execute()
       ├── 1단계: 입력값 검증
       ├── 2단계: 인증 세션 조회
       │   └── BaekjoonCacheService.getVerificationSession()
       ├── 3단계: solved.ac API 이름 확인
       │   └── SolvedAcApiAdapter.getUserAdditionalInfo()
       │       └── SolvedAcHttpClient.get()
       ├── 4단계: 인증 문자열 검증
       │   └── VerificationString.matches()
       ├── 5단계: 인증 완료 처리
       │   ├── VerificationSession.markCompleted()
       │   ├── BaekjoonUser.markAsVerified()
       │   └── BaekjoonProfileRepository.save()
       └── 6단계: 세션 정리
           └── BaekjoonCacheService.delete()
```

### 🎯 **핵심 비즈니스 로직**

- JWT 토큰 검증
- 활성 인증 세션 확인
- solved.ac 프로필 name(nameNative) 실시간 조회
- 인증 문자열 일치 여부 확인
- 사용자 인증 상태 업데이트
- 인증 완료 후 세션 삭제

### 📤 **Response**: `VerificationResultResponseDto`

---

## 🔍 3. GET `/baekjoon/verification/status/:userId` - 인증 상태 조회

### 📥 **Request Flow**

```
1. BaekjoonController.getVerificationStatus()
   ├── @UseGuards(JwtAuthGuard) - JWT 인증 필요
   ├── @Param("userId") string
   └── 직접 BaekjoonFacadeService 호출

2. BaekjoonFacadeService.getVerificationStatus()
   └── BaekjoonCacheService.getVerificationSession()
       ├── Redis에서 세션 조회
       └── VerificationSession 객체 반환
```

### 🎯 **핵심 비즈니스 로직**

- JWT 토큰 검증
- 사용자별 인증 세션 상태 조회
- 세션 만료 여부 확인

### 📤 **Response**: `VerificationStatusResponseDto`

---

## 👤 4. GET `/baekjoon/profile?handle=xxx` - 프로필 조회

### 📥 **Request Flow**

```
1. BaekjoonController.getProfile()
   ├── @UseGuards(JwtAuthGuard) - JWT 인증 필요
   ├── @Query() GetProfileRequestDto
   └── BaekjoonRequestMapper.toGetProfileInput()

2. BaekjoonFacadeService.getProfile()
   └── GetProfileUseCaseImpl.execute()
       ├── 1단계: 입력값 검증
       │   └── BaekjoonUser.validateUserIdAndHandle()
       ├── 2단계: 기존 사용자 조회
       │   └── BaekjoonProfileRepository.findByUserId()
       ├── 3단계: 캐시된 데이터 확인
       │   └── BaekjoonCacheService.getProfile()
       ├── 4단계: API 데이터 조회 (캐시 없으면)
       │   └── SolvedAcApiAdapter.getUserProfile()
       │       └── SolvedAcHttpClient.get()
       ├── 5단계: 프로필 데이터 변환
       │   └── BaekjoonDomainMapper.toBaekjoonUser()
       ├── 6단계: 데이터 저장 및 캐싱
       │   ├── BaekjoonProfileRepository.save()
       │   └── BaekjoonCacheService.setProfile()
       └── 7단계: 응답 변환
           └── BaekjoonResponseMapper.toBaekjoonProfileOutput()
```

### 🎯 **핵심 비즈니스 로직**

- JWT 토큰 검증
- 사용자 ID와 handle 검증
- 45분 캐시 확인 (Redis)
- solved.ac API 프로필 조회
- TypeORM을 통한 DB 저장
- 응답 데이터 변환

### 📤 **Response**: `BaekjoonProfileResponseDto`

---

## 📊 5. GET `/baekjoon/statistics?handle=xxx` - 태그 통계 조회

### 📥 **Request Flow**

```
1. BaekjoonController.getStatistics()
   ├── @UseGuards(JwtAuthGuard) - JWT 인증 필요
   ├── @Query() GetTagStatisticsRequestDto
   └── BaekjoonRequestMapper.toGetStatisticsInput()

2. BaekjoonFacadeService.getStatistics()
   └── GetStatisticsUseCaseImpl.execute()
       ├── 1단계: 입력값 검증
       │   └── BaekjoonUser.validateUserIdAndHandle()
       ├── 2단계: 기존 사용자 조회
       │   └── BaekjoonProfileRepository.findByUserId()
       ├── 3단계: 동기화 필요성 확인
       │   └── BaekjoonUser.possibleSync()
       ├── 4단계: 캐시된 통계 확인
       │   └── BaekjoonStatisticsRepositoryPort.findTagStatisticsByHandle()
       │       └── BaekjoonStatisticsRepository.findTagStatisticsByHandle()
       ├── 5단계: API 데이터 조회 (필요시)
       │   ├── SolvedAcApiAdapter.getUserProfile()
       │   └── SolvedAcApiAdapter.getUserTagRatings()
       │       └── SolvedAcHttpClient.get()
       ├── 6단계: 통계 데이터 변환
       │   ├── processTopTags() - 태그별 정렬
       │   └── buildTierStats() - 티어 통계 생성
       ├── 7단계: 데이터 저장
       │   ├── BaekjoonProfileRepository.save()
       │   └── BaekjoonStatisticsRepositoryPort.saveTagStatistics()
       │       └── BaekjoonStatisticsRepository.saveTagStatistics() (NoSQL)
       └── 8단계: 응답 변환
           └── BaekjoonDomainMapper.toTagStatisticsOutputDto()
```

### 🎯 **핵심 비즈니스 로직**

- JWT 토큰 검증
- 동기화 필요성 판단 (마지막 동기화 시간 기준)
- NoSQL에서 캐시된 태그 통계 조회
- solved.ac API에서 프로필 + 태그 레이팅 조회
- 태그별 문제 수, 레이팅 정렬 및 처리
- NoSQL과 TypeORM 이중 저장

### 📤 **Response**: `TagStatisticsResponseDto`

---

## 🔄 백그라운드 작업: 인증 상태 동기화

### **SyncVerificationStatusUseCaseImpl**

```
1. syncFromSession(sessionId)
   ├── BaekjoonCacheService.get() - 세션 조회
   ├── BaekjoonProfileRepository.findByUserId() - 사용자 조회
   ├── performSync() - 상태 동기화 로직
   │   ├── session.isCompleted() && !user.isVerified()
   │   │   └── user.markAsVerified()
   │   └── session.isFailed() && user.isPending()
   │       └── user.updateVerificationResult("REJECTED")
   └── BaekjoonProfileRepository.save()

2. cleanupFailedSessions()
   └── Redis SCAN으로 만료된 세션들 정리

3. forceSyncUser(userId)
   └── 특정 사용자 강제 동기화
```

---

## 🏗️ 아키텍처 레이어별 역할

### **Infrastructure Layer**

- **Controllers**: HTTP 요청/응답 처리, 인증 가드 적용
- **Mappers**: Request ↔ Input DTO 변환
- **External Adapters**: solved.ac API 호출
- **Persistence Adapters**: TypeORM (사용자 프로필), NoSQL (태그 통계)
- **Service Adapters**: Redis 캐시, Rate Limiting

### **Application Layer**

- **Facade Service**: 각 UseCase 호출 조율
- **Use Cases**: 핵심 비즈니스 로직 구현
- **Mappers**: Domain ↔ Output DTO 변환
- **Ports**: 인터페이스 정의 (의존성 역전)

### **Domain Layer**

- **Entities**: BaekjoonUser, VerificationSession
- **Value Objects**: BaekjoonHandle, VerificationString, Tier

---

## 🔐 보안 및 제한사항

### **Rate Limiting (Redis 기반)**

- API 호출: 30분/1회 (BaekjoonRateLimitService)
- 인증 시도: 10분/3회
- IP 기반: 5분/10회

### **캐싱 전략**

- **프로필 데이터**: 45분 TTL (Redis)
- **태그 통계**: 45분 TTL (NoSQL)
- **인증 세션**: 1시간 TTL (Redis)

### **에러 처리**

- 모든 레이어에서 ErrorUtils.getErrorMessage() 사용
- @nestjs/common Logger로 구조화된 로깅
- 사용자 친화적 에러 메시지 변환

---

## 🔄 리팩토링 후 아키텍처 개선사항

### **Port-Adapter 패턴 최적화**

#### ✅ **Before vs After**

**이전 구조 (중복 레이어)**:
```
UseCase → BaekjoonRepositoryPort → BaekjoonTagNosqlAdapter → BaekjoonTagNosqlRepository → NoSQL
```

**현재 구조 (직접 통합)**:
```
UseCase → BaekjoonStatisticsRepository (extends BaseNoSQLRepository) → NoSQL
```

#### 🎯 **개선된 네이밍 컨벤션**

| 레이어 | 타입 | 네이밍 규칙 | 예시 |
|--------|------|-------------|------|
| **Port** | Interface | `~RepositoryPort` | `BaekjoonProfileRepositoryPort` |
| **영속성** | Implementation | `~Repository` | `BaekjoonProfileRepository`, `BaekjoonStatisticsRepository` |
| **외부 API** | Implementation | `~Adapter` | `SolvedAcApiAdapter` |

#### 🚀 **성능 및 유지보수성 향상**

- **함수 호출 오버헤드 제거**: 중간 레이어 제거로 성능 향상
- **코드 복잡도 감소**: 한 곳에서 모든 NoSQL 로직 관리
- **명확한 책임 분리**: Repository가 직접 데이터 액세스 담당
- **일관성 있는 네이밍**: 모든 구현체가 명확한 컨벤션 따름

### **현재 Repository 구조**

```typescript
// 🔵 Profile Repository (TypeORM)
BaekjoonProfileRepository implements BaekjoonProfileRepositoryPort {
  // 사용자 프로필 CRUD
  save(), findByUserId(), findByBaekjoonId(), update(), delete()
  
  // 인증 상태 관리
  updateVerificationStatus(), findPendingVerificationUsers()
  
  // 멘토 자격 관리  
  findMentorEligibleUsers(), countMentorEligibleUsers()
}

// 🟢 Statistics Repository (NoSQL)
BaekjoonStatisticsRepository 
  extends BaseNoSQLRepository<BaekjoonTagDocument>
  implements BaekjoonStatisticsRepositoryPort {
  
  // 태그 통계 관리
  saveTagStatistics(), findTagStatisticsByUserId()
  findTagStatisticsByHandle(), updateTagStatistics()
  
  // 직접 NoSQL 쿼리 수행
  saveApiResponse(), findByHandle(), findByUserId()
}
```

---

이 플로우를 통해 백준 모듈의 모든 실행 경로와 의존성을 추적할 수 있습니다.
