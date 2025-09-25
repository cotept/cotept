## 📋 CotePT 백엔드 개발 워크플로우

🎯 핵심 원칙

1. Endpoint-First Development (EFD)

- 하나의 API 엔드포인트 = 하나의 완전한 기능
- 레이어별 개발이 아닌 기능별 수직 개발
- 각 엔드포인트는 독립적으로 테스트 가능해야 함

2. Test-Driven Development (TDD)

- RED → GREEN → REFACTOR 사이클 준수
- 실패하는 테스트부터 작성
- 테스트 통과를 위한 최소 코드 작성 후 리팩토링
- 테스트 it 주석은 한국어로 작성한다.

3. Convention Over Configuration

- 파일을 개발하기 전에 User 모듈의 구현 방식과 패턴을 확인하고 반드시 준수한다.
- 파일명, 클래스명, 메서드명 일관성 유지
- 헥사고날 아키텍처 레이어 경계 엄격히 준수

🔄 단일 엔드포인트 개발 플로우

Phase 1: 준비 (Planning)

0. domain 모델, persistence entity 정의.

1. API 스펙 정의 (OpenAPI)
   - 요청/응답 구조
   - 에러 케이스
   - 비즈니스 규칙

2. 테스트 시나리오 작성
   - Happy Path
   - Edge Cases
   - Error Cases

Phase 2: 테스트 작성 (Test-First)

@project-knowledge/test-guidelines.md 를 반드시 준수하여 개발한다.

0. Domain 테스트 (단위 테스트)
   ├── 성공 케이스
   ├── 실패 케이스
   └── 경계값 테스트

1. UseCase 테스트 (단위 테스트)
   ├── 성공 케이스
   ├── 실패 케이스 (도메인 예외)
   └── 경계값 테스트

2. Controller 테스트 (통합 테스트)
   ├── HTTP 요청/응답 검증
   ├── 인증/인가 검증
   └── 에러 응답 검증

Phase 3: 구현 (Implementation)

순서:

1. Domain DTO 작성 (application/dto/)
2. UseCase Port 정의 (application/ports/in/)
3. UseCase Implementation (application/services/usecases/)
4. Mapper 메서드 추가 (필요한 것만)
5. facade 적용
6. Controller 메서드 구현
7. 통합 테스트 실행

Phase 4: 검증 및 정리 (Validation)

1. 모든 테스트 통과 확인
2. 코드 리뷰 (자가 검토)
3. API 문서 업데이트
4. 다음 엔드포인트로 이동

📁 파일 작성 순서 및 네이밍 규칙

파일 생성 순서

1. 테스트 파일
   ├── {entity}.usecase.spec.ts
   └── {entity}.controller.spec.ts

2. DTO 파일
   ├── {action}-{entity}.dto.ts (요청)
   └── {entity}.dto.ts (응답, 공통)

3. UseCase 파일
   ├── {action}-{entity}.usecase.ts (Port)
   └── {action}-{entity}.usecase.impl.ts (Implementation)

4. facade 파일
   └── {domain}-facade.service.ts

5. Controller 메서드
   └── {action}{Entity}() 메서드 추가

6. Mapper 메서드
   └── 필요한 변환 메서드만 추가

네이밍 컨벤션

// DTO
CreateMentorProfileDto // 요청 DTO
MentorProfileDto // 응답 DTO (공통)

// Facade
MentorProfileFacadeService

// UseCase
CreateMentorProfileUseCase // Port
CreateMentorProfileUseCaseImpl // Implementation

// Controller 메서드
createMentorProfile()
getMentorProfile()
updateMentorProfile()

// Test 파일
create-mentor-profile.usecase.spec.ts
mentor-profile.controller.spec.ts

🛡️ 품질 보장 체크리스트

각 엔드포인트 완료 시 확인사항

- 모든 테스트 통과 (단위 + 통합)
- TypeScript strict 모드 통과
- ESLint 규칙 준수
- Swagger 문서 생성 확인
- 헥사고날 아키텍처 레이어 경계 준수
- 에러 처리 및 로깅 적절히 구현
- User 모듈과 동일한 패턴 적용

🤝 협업 가이드라인

코드 리뷰 관점

1. 아키텍처 준수: 레이어 경계 위반 없는지
2. 테스트 커버리지: 핵심 로직 테스트 되었는지
3. 컨벤션 일관성: User 모듈 패턴과 일치하는지
4. 에러 처리: 적절한 도메인 예외 사용하는지
5. 성능: N+1 쿼리 등 성능 이슈 없는지

문서화 기준

- API 변경 시 OpenAPI 스펙 즉시 업데이트
- 복잡한 비즈니스 로직은 주석으로 설명
- 새로운 패턴 도입 시 CLAUDE.md에 기록

⚡ 효율성 극대화 전략

중복 제거

- Shared 모듈에서 공통 패턴 추상화
- Base 클래스 활용으로 보일러플레이트 최소화
- 공통 Decorator, Validator 재사용

자동화

- 테스트 실행 자동화 (watch mode)
- API 문서 자동 생성
- 코드 포맷팅 자동화 (prettier, eslint)
