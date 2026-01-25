# 백준 모듈 테스트 구현 계획서

## 📅 작업 일정: 내일 시작

### 🎯 목표
백준 모듈의 체계적인 테스트 코드 작성을 통한 코드 품질 향상 및 리팩토링 안정성 확보

---

## 🏗️ 현재 상황 요약

### ✅ 완료된 리팩토링 작업
1. **Port-Adapter 패턴 최적화**
   - `BaekjoonRepositoryPort` 삭제 (두루뭉술한 포트 제거)
   - 도메인별 포트 분리: `BaekjoonProfileRepositoryPort`, `BaekjoonStatisticsRepositoryPort`

2. **네이밍 컨벤션 통일**
   - `BaekjoonProfileRepositoryImpl` → `BaekjoonProfileRepository`
   - `BaekjoonTagNosqlAdapter` → `BaekjoonStatisticsRepository`
   - 파일명: `baekjoon-nosql.adapter.ts` → `baekjoon-statistics.repository.ts`

3. **레이어 통합**
   - 중복 레이어 제거: `BaekjoonTagNosqlRepository` 삭제
   - `BaekjoonStatisticsRepository`가 직접 NoSQL 처리

4. **UseCase별 포트 분리**
   - Profile 관련 UseCase → `BaekjoonProfileRepositoryPort`
   - Statistics 관련 UseCase → `BaekjoonStatisticsRepositoryPort`

### 📁 현재 구조
```
src/modules/baekjoon/
├── application/
│   ├── dtos/
│   ├── mappers/
│   ├── ports/
│   │   ├── in/ (UseCase 인터페이스)
│   │   └── out/ (Repository 포트)
│   └── services/
│       ├── facade/
│       └── usecases/
├── domain/
│   ├── model/
│   └── vo/
└── infrastructure/
    └── adapter/
        ├── in/
        │   └── controllers/
        └── out/
            ├── external/ (solved.ac API)
            ├── persistence/
            │   ├── nosql/ (BaekjoonStatisticsRepository)
            │   └── typeorm/ (BaekjoonProfileRepository)
            └── services/ (Cache, RateLimit)
```

---

## 🧪 테스트 구현 계획

### 📋 테스트 원칙 (project-knowledge/test-guidelines.md 기반)

#### **FIRST 원칙**
- ⚡ **Fast**: Mock 사용으로 외부 의존성 제거
- 🔒 **Isolated**: 각 테스트 독립 실행
- 🔄 **Repeatable**: 고정된 Mock 데이터 사용
- ✅ **Self-Validating**: 명확한 expect 문
- ⏰ **Timely**: TDD 방식 적용

#### **Right-BICEP 테스트 범위**
- ✅ **Right**: 모든 비즈니스 요구사항 검증
- 🎯 **Boundary**: 입력값 경계 조건 (3-20자 핸들 등)
- 🔄 **Inverse**: 성공/실패 케이스 모두
- 🔗 **Cross-check**: 다양한 조건 조합
- ⚠️ **Error**: 예외 처리 완전 테스트
- 📈 **Performance**: 핵심 기능 성능 측정

#### **CORRECT 테스트 조건**
- 📝 **Conformance**: 요구사항 준수
- 📊 **Ordering**: 순서 중요 기능
- 📏 **Range**: 입력값 범위 검증
- 🔗 **Reference**: 외부 의존성 Mock
- ❓ **Existence**: null/undefined 처리
- 📦 **Cardinality**: 0-1-N 케이스
- ⏰ **Time**: 시간/동시성 테스트

---

## 🚀 1일차 실행 계획

### Phase 1: 환경 설정 (30분)

```bash
# 1. 테스트 관련 패키지 설치 확인
npm list @nestjs/testing jest

# 2. 테스트 디렉토리 구조 생성
mkdir -p src/modules/baekjoon/tests/{unit,integration}/{domain,application,infrastructure}
mkdir -p src/modules/baekjoon/tests/__mocks__
```

### Phase 2: 핵심 Domain 테스트 작성 (2시간)

#### 🎯 우선순위 1: BaekjoonUser 엔티티

```typescript
// src/modules/baekjoon/tests/unit/domain/baekjoon-user.spec.ts
describe('BaekjoonUser', () => {
  // C (Conformance) - 요구사항 준수
  describe('사용자 생성', () => {
    it('solved.ac API 데이터로 올바른 사용자를 생성한다')
    it('필수 필드가 누락된 경우 예외를 발생시킨다')
  })

  // E (Existence) - 값 존재 여부
  describe('값 존재 여부 검증', () => {
    it('userId가 null인 경우 예외를 발생시킨다')
    it('handle이 빈 문자열인 경우 예외를 발생시킨다')
  })

  // R (Range) - 범위 검증
  describe('입력값 범위 검증', () => {
    it('유효한 티어 범위(0-30)를 허용한다')
    it('범위를 벗어난 티어를 거부한다')
  })

  // B (Boundary) - 경계 조건
  describe('경계 조건', () => {
    it('최소 티어(0)로 사용자를 생성한다')
    it('최대 티어(30)로 사용자를 생성한다')
  })
})
```

#### 🎯 우선순위 2: VerificationSession 엔티티

```typescript
// src/modules/baekjoon/tests/unit/domain/verification-session.spec.ts
describe('VerificationSession', () => {
  // T (Time) - 시간 관련
  describe('세션 시간 관리', () => {
    it('생성시 1시간 TTL을 설정한다')
    it('만료된 세션을 올바르게 식별한다')
  })

  // I (Inverse) - 반대 케이스
  describe('상태 변경', () => {
    it('PENDING에서 COMPLETED로 변경할 수 있다')
    it('COMPLETED에서 PENDING으로 변경할 수 없다')
  })
})
```

### Phase 3: 핵심 UseCase 테스트 작성 (3시간)

#### 🎯 최우선: GetProfileUseCaseImpl

```typescript
// src/modules/baekjoon/tests/unit/application/usecases/get-profile.usecase.spec.ts
describe('GetProfileUseCaseImpl', () => {
  let usecase: GetProfileUseCaseImpl
  let mockProfileRepository: jest.Mocked<BaekjoonProfileRepositoryPort>
  let mockSolvedAcApi: jest.Mocked<SolvedAcApiPort>
  let mockMapper: jest.Mocked<BaekjoonDomainMapper>

  beforeEach(() => {
    // Given-When-Then 구조의 Given 부분
    // Mock 객체들 설정
  })

  // 정상 플로우 (Given-When-Then)
  describe('기존 사용자 프로필 조회', () => {
    it('저장된 사용자의 프로필을 반환한다', async () => {
      // Given: 기존 사용자 데이터
      const existingUser = new BaekjoonUser(/* test data */)
      mockProfileRepository.findByUserId.mockResolvedValue(existingUser)
      
      // When: 프로필 조회 실행
      const result = await usecase.execute({ userId: 'test', handle: 'testuser' })
      
      // Then: 올바른 결과 반환
      expect(result).toBeDefined()
      expect(result.handle).toBe('testuser')
      expect(mockSolvedAcApi.getUserProfile).not.toHaveBeenCalled() // API 호출 안함
    })
  })

  // Error Conditions
  describe('에러 상황 처리', () => {
    it('존재하지 않는 백준 ID로 BadRequestException을 발생시킨다', async () => {
      // Given: API에서 사용자 없음
      mockProfileRepository.findByUserId.mockResolvedValue(null)
      mockSolvedAcApi.getUserProfile.mockResolvedValue(null)
      
      // When & Then: 예외 발생 확인
      await expect(usecase.execute({ userId: 'test', handle: 'invalid' }))
        .rejects.toThrow('존재하지 않는 백준 ID입니다.')
    })
  })

  // Boundary Conditions
  describe('경계 조건', () => {
    it('최소 길이 핸들(3자)로 성공한다')
    it('최대 길이 핸들(20자)로 성공한다')
    it('범위 초과 핸들로 실패한다')
  })
})
```

### Phase 4: Mock 설정 파일 작성 (30분)

```typescript
// src/modules/baekjoon/tests/__mocks__/solved-ac-api.mock.ts
export const mockSolvedAcApi = {
  getUserProfile: jest.fn(),
  getUserTagRatings: jest.fn(),
  getUserAdditionalInfo: jest.fn()
}

// src/modules/baekjoon/tests/__mocks__/repositories.mock.ts
export const mockProfileRepository = {
  save: jest.fn(),
  findByUserId: jest.fn(),
  findByBaekjoonId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn(),
  updateVerificationStatus: jest.fn(),
  findPendingVerificationUsers: jest.fn(),
  findVerifiedUsers: jest.fn(),
  findMentorEligibleUsers: jest.fn(),
  countMentorEligibleUsers: jest.fn()
}

export const mockStatisticsRepository = {
  saveTagStatistics: jest.fn(),
  findTagStatisticsByUserId: jest.fn(),
  findTagStatisticsByHandle: jest.fn(),
  updateTagStatistics: jest.fn(),
  deleteTagStatistics: jest.fn()
}
```

---

## 📝 내일 시작할 때 할 일

### 1. Claude에게 질문하기
```
안녕! 어제 백준 모듈 리팩토링을 함께 완료했어. 
오늘은 테스트 코드를 작성하려고 해.

TEST_PLAN.md 파일을 만들어뒀는데, 
Phase 1부터 차근차근 시작해보자.

먼저 테스트 환경 설정부터 도와줘.
```

### 2. 첫 번째 작업
- [ ] 테스트 디렉토리 구조 생성
- [ ] Jest 설정 확인
- [ ] BaekjoonUser 엔티티 테스트 작성 시작

### 3. 체크포인트
- 각 테스트 파일 작성 후 `npm test` 실행
- Coverage 80% 이상 유지
- 모든 테스트 통과 확인

---

## 🎯 성공 기준

### Day 1 목표
- [x] Domain 엔티티 테스트 완료 (BaekjoonUser, VerificationSession)
- [x] GetProfileUseCaseImpl 테스트 완료
- [x] 기본 Mock 설정 완료
- [x] 테스트 실행 환경 구축

### 전체 목표 (1주)
- Unit Tests: 90% Coverage
- Integration Tests: 주요 Repository 테스트
- E2E Tests: 핵심 인증 플로우

---

## 💡 참고사항

### 테스트 파일 네이밍 규칙
- Unit Tests: `*.spec.ts`
- Integration Tests: `*.integration.spec.ts`
- E2E Tests: `*.e2e.spec.ts`

### Mock 데이터 예시
```typescript
const mockBaekjoonUser = {
  userId: 'test@example.com',
  handle: 'testuser',
  currentTier: 15,
  rating: 1500,
  solvedCount: 100,
  verificationStatus: 'VERIFIED'
}

const mockSolvedAcResponse = {
  handle: 'testuser',
  bio: '',
  tier: 15,
  rating: 1500,
  solvedCount: 100,
  profileImageUrl: null
}
```

이제 내일 이 계획서를 바탕으로 바로 테스트 작성을 시작할 수 있습니다! 🚀