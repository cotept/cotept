# 🚀 코테피티 헥사고날 아키텍처 모듈 생성 가이드

## 📋 목차
- [빠른 시작](#빠른-시작)
- [사용법](#사용법)
- [VSCode 통합](#vscode-통합)
- [생성된 구조](#생성된-구조)
- [개발 흐름](#개발-흐름)

## 🚀 빠른 시작

### 1. 스크립트 실행 권한 부여
```bash
chmod +x scripts/create-module.sh
```

### 2. 새 모듈 생성
```bash
# 방법 1: 스크립트 직접 실행
./scripts/create-module.sh baekjoon

# 방법 2: npm script 사용
cd apps/api
npm run create:module baekjoon

# 방법 3: VSCode Command Palette
# Ctrl+Shift+P → "Tasks: Run Task" → "Create New Module"
```

## 🛠️ 사용법

### 터미널에서 사용
```bash
# 현재 디렉토리: /home/hsj95/workspace/dev/project/cotept

# 백준 모듈 생성
./scripts/create-module.sh baekjoon

# 멘토링 모듈 생성  
./scripts/create-module.sh mentoring

# 결제 모듈 생성
./scripts/create-module.sh payment
```

### npm scripts 사용
```bash
cd apps/api

# 모듈 생성
npm run create:module [모듈명]

# 특정 모듈 테스트
npm run test:module [모듈명]

# 모듈 구조 분석
npm run analyze:module
```

## 🎯 VSCode 통합

### 1. Task Runner 사용
1. `Ctrl+Shift+P` 열기
2. `Tasks: Run Task` 선택
3. `Create New Module` 선택
4. 모듈명 입력 (예: baekjoon)

### 2. 코드 스니펫 사용
| 스니펫 | 설명 |
|--------|------|
| `hex-module` | 헥사고날 모듈 구조 |
| `hex-entity` | 도메인 엔티티 |
| `hex-usecase` | 유스케이스 인터페이스 |
| `hex-usecase-impl` | 유스케이스 구현체 |
| `hex-repo-port` | 레포지토리 포트 |
| `hex-repo-impl` | 레포지토리 구현체 |
| `hex-vo` | 값 객체 |
| `hex-mapper` | 매퍼 클래스 |

### 3. 설정 파일
- `.vscode/tasks.json`: VSCode 태스크 설정
- `.vscode/typescript.code-snippets`: TypeScript 스니펫

## 📁 생성된 구조

```
baekjoon/
├── baekjoon.module.ts                 # NestJS 모듈 정의
├── domain/                            # 도메인 계층
│   ├── model/
│   │   ├── baekjoon.ts               # 도메인 엔티티
│   │   └── __tests__/
│   └── vo/                           # 값 객체
│       └── __tests__/
├── application/                       # 애플리케이션 계층
│   ├── dtos/                         # 데이터 전송 객체
│   │   ├── create-baekjoon.dto.ts
│   │   ├── update-baekjoon.dto.ts
│   │   ├── baekjoon.dto.ts
│   │   └── index.ts
│   ├── mappers/                      # 도메인-DTO 매핑
│   ├── ports/
│   │   ├── in/                       # 인바운드 포트
│   │   └── out/                      # 아웃바운드 포트
│   └── services/
│       ├── facade/                   # 파사드 서비스
│       └── usecases/                 # 유스케이스 구현
└── infrastructure/                    # 인프라스트럭처 계층
    └── adapter/
        ├── in/                       # 인바운드 어댑터
        │   ├── controllers/          # REST 컨트롤러
        │   └── mappers/              # 요청-응답 매핑
        └── out/                      # 아웃바운드 어댑터
            ├── persistence/          # 영속성
            │   ├── entities/         # TypeORM 엔티티
            │   ├── mappers/          # 영속성 매핑
            │   └── repositories/     # 레포지토리 구현
            └── services/             # 외부 서비스
```

## 🔄 개발 흐름

### Phase 1: 도메인 모델링 (1-2일)
```bash
# 1. 도메인 엔티티 구현
code apps/api/src/modules/baekjoon/domain/model/baekjoon.ts

# 2. 값 객체 구현  
code apps/api/src/modules/baekjoon/domain/vo/

# 3. 도메인 테스트 작성
npm run test:module baekjoon
```

### Phase 2: 애플리케이션 계층 (2-3일)
```bash
# 1. DTO 정의
code apps/api/src/modules/baekjoon/application/dtos/

# 2. 유스케이스 구현
code apps/api/src/modules/baekjoon/application/services/usecases/

# 3. 매퍼 구현
code apps/api/src/modules/baekjoon/application/mappers/
```

### Phase 3: 인프라스트럭처 (2-3일)
```bash
# 1. TypeORM 엔티티
code apps/api/src/modules/baekjoon/infrastructure/adapter/out/persistence/entities/

# 2. 레포지토리 구현
code apps/api/src/modules/baekjoon/infrastructure/adapter/out/persistence/repositories/

# 3. 컨트롤러 구현
code apps/api/src/modules/baekjoon/infrastructure/adapter/in/controllers/
```

### Phase 4: 통합 및 테스트 (1-2일)
```bash
# 1. 모듈 등록
code apps/api/src/app.module.ts

# 2. 테스트 실행
npm run test:module baekjoon

# 3. 통합 테스트
npm run test:e2e
```

## 🎯 다음 단계 체크리스트

모듈 생성 후 다음 항목들을 순서대로 구현하세요:

### ✅ 도메인 계층
- [ ] 도메인 엔티티 비즈니스 로직 구현
- [ ] 값 객체 검증 규칙 구현  
- [ ] 도메인 이벤트 정의 (필요시)
- [ ] 도메인 서비스 구현 (필요시)

### ✅ 애플리케이션 계층
- [ ] DTO 속성 및 검증 규칙 정의
- [ ] 유스케이스 인터페이스 완성
- [ ] 유스케이스 구현체 작성
- [ ] 매퍼 로직 구현

### ✅ 인프라스트럭처 계층
- [ ] TypeORM 엔티티 스키마 정의
- [ ] 레포지토리 구현 완성
- [ ] 컨트롤러 엔드포인트 구현
- [ ] 외부 서비스 어댑터 구현 (필요시)

### ✅ 테스트 및 통합
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성
- [ ] app.module.ts에 모듈 등록
- [ ] API 문서 업데이트

## 🔧 트러블슈팅

### 스크립트 실행 권한 오류
```bash
chmod +x scripts/create-module.sh
```

### 모듈 등록 오류
`app.module.ts`에서 새 모듈을 imports 배열에 추가했는지 확인:
```typescript
import { BaekjoonModule } from './modules/baekjoon/baekjoon.module';

@Module({
  imports: [
    // 기존 모듈들...
    BaekjoonModule,
  ],
})
export class AppModule {}
```

### TypeORM 엔티티 등록 오류
`baekjoon.module.ts`에서 TypeORM 엔티티가 올바르게 등록되었는지 확인:
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([BaekjoonEntity]),
  ],
  // ...
})
```

## 📚 참고 자료

- [헥사고날 아키텍처 가이드](./HEXAGONAL_ARCHITECTURE.md)
- [SOLID 원칙 가이드](./SOLID_PRINCIPLES.md)
- [테스트 가이드라인](./TEST_GUIDELINES.md)
- [코드 스타일 가이드](./CODE_STYLE.md)

---

🎉 **Happy Coding!** 일관되고 확장 가능한 코테피티 모듈을 만들어보세요!
