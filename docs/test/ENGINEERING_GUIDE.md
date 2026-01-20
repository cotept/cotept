# Engineering Guide (v2.1)

## 1. 테스트 가능성 최우선 (Testability First)

- **비즈니스 로직 분리**: 날짜 계산, 필터링 등은 순수 함수로 분리하고 외부 의존성(HTTP, 세션, React Query)은 인자로 주입합니다.
- **단위 테스트 필수**: 분리된 함수에는 Vitest(Front) 또는 Jest(Back) 단위 테스트를 필수로 작성합니다.
- **복잡한 로직 추출**: JSX/템플릿에 복잡한 분기·데이터 변환이 보이면 즉시 헬퍼 함수나 커스텀 훅으로 추출하여 테스트합니다.

## 2. SOLID / 단일 책임

- **역할 분리**: 한 모듈은 한 가지 역할만 담당합니다. 서비스 레이어에서 데이터 조합을 끝내고 UI는 렌더링에 집중합니다.
- **의존성 주입**: 인터페이스/타입으로 의존성을 명시하고 직접 인스턴스화 대신 주입받습니다. Mock 가능한 추상화를 사용합니다.

## 3. Dumb Components 유지

- **Props 기반 렌더링**: 화면 컴포넌트는 props로 받은 데이터만 렌더링하며, 상태 관리·API 호출은 컨테이너나 훅에서 처리합니다.
- **핸들러 주입**: 이벤트 핸들러도 상위에서 주입하며 내부에서 네트워크/스토리지에 직접 접근하지 않습니다.
- **테스트 용이성**: Storybook·Vitest에서 손쉽게 Mocking 및 언리그드(Un-rigged) 렌더링이 가능하도록 유지합니다.

## 4. 뷰와 로직 분리

- **데이터 준비 완료**: 데이터 준비(쿼리, 권한, 가공)는 훅/서비스에서 끝내고 컴포넌트는 정제된 데이터만 받습니다.
- **상수화**: 반복/조건 렌더링은 map/filter 결과를 상수로 만든 뒤 JSX에 주입합니다.
- **케이스 주입**: 분리 덕분에 Storybook·Playwright에서 다양한 케이스를 쉽게 주입하여 테스트할 수 있습니다.

## 5. 디자인 시스템 & 스타일링 (Styling Strategy)

- **디자인 토큰**: 색상·폰트·간격 등 공통 값은 Style Dictionary나 Tailwind config로 중앙 관리하고 Figma와 주기적으로 동기화합니다.
- **CSS 표준**: CSS Modules/Tailwind/CSS-in-JS 중 프로젝트 표준을 정해 컴포넌트 간 스타일링 일관성을 유지합니다.

## 6. Storybook + MSW

- **Mocking 환경**: 각 컴포넌트별 `.stories.tsx`를 작성하고, `useSession`·React Query 등은 Decorator/Mock Provider로 감쌉니다.
- **핸들러 재사용**: 공용 MSW 핸들러를 Storybook·Vitest·Playwright에서 재사용해 로딩/성공/에러 및 다양한 날짜 범위를 재현합니다.
- **시각적 회귀**: 비주얼 회귀 테스트와 연결하며, API 스펙 변경 시 MSW 핸들러도 함께 업데이트합니다.

## 7. Vitest(Front) / Jest(Back)

- **프런트엔드**: Vitest + React Testing Library가 기본이며, 훅·유틸 로직은 100% 커버리지를 목표로 합니다.
- **백엔드/공통**: 서버/라이브러리 로직은 Jest로 테스트하고 DB 접근은 테스트 DB나 Mocker로 분리합니다. 공통 유틸은 Pure TypeScript로 작성해 두 러너 모두에서 재사용합니다.

## 8. Playwright E2E

- **시나리오 기록**: 핵심 사용자 플로우(로그인→회차 선택→병원 검색 등)를 Playwright 시나리오로 기록합니다.
- **Mock vs Real**: 기본은 MSW/Mock API로 안정화하고, 실제 DB가 필요한 시나리오는 Stage 전용 DB에서 `Seed → 테스트 → Cleanup`으로 따로 실행합니다.
- **CI 연동**: PR마다 주요 시나리오를 CI에서 자동 실행해 회귀를 차단합니다.

## 9. 에러 로깅 & 모니터링

- **Sentry 적용**: Front/Back 모두 Sentry(혹은 동급)를 필수 적용합니다. 환경별 DSN, 버전, 사용자 정보 등을 태그로 기록합니다.
- **중앙 전파**: React Error Boundary, Next.js 서버 핸들러, Node 서비스 레이어에서 모든 에러를 중앙 로거로 전파합니다.
- **알림 및 관리**: 경고 이상 이슈는 Slack/메일과 연동하고, 릴리즈마다 Sentry Release 관리 절차를 운영합니다.

## 10. 보안 및 의존성 관리 (DevSecOps)

- **공급망 보안**: `Renovate` 또는 `Dependabot`을 도입하여 의존성 패키지를 최신 상태로 유지하고, CI 단계에서 `npm audit` 등으로 취약점을 자동 차단합니다.
- **시크릿 관리**: API Key 등 민감 정보는 저장소에 절대 포함하지 않으며, AWS Secrets Manager나 Doppler, CI Secrets를 통해 주입합니다.

## 11. CI/CD & 브랜치 배포

- **자동화 파이프라인**: PR마다 `Lint → Test → Storybook Build → Playwright Smoke → Lighthouse CI`를 자동 실행합니다.
- **프리뷰 환경**: Vercel Preview 같은 Branch Deploy URL을 생성해 QA·디자인이 즉시 검증할 수 있게 하고, 통과 후에만 머지합니다.

## 12. 기능 플래그 전략 (Feature Flags)

- **배포·출시 분리**: LaunchDarkly 등 Feature Flag를 도입해 배포와 사용자 노출을 분리하고 문제가 생기면 플래그로 즉시 비활성화합니다.
- **릴리즈 플랜**: 신규 기능은 플래그 ON/OFF 상태를 명확히 관리하고 QA/PM 확인 후 전체 공개합니다.

## 13. 코드 스타일 & 정적 분석

- **규칙 통일**: ESLint + Prettier 규칙을 전 Repo에 적용하고 `tsconfig` strict 모드를 유지합니다.
- **지속 점검**: SonarQube 등으로 복잡도 및 보안 이슈를 지속적으로 점검합니다.

## 14. 문서화 및 아키텍처 기록 (Documentation)

- **ADR 작성**: 주요 기술적 의사결정(라이브러리 선정, 아키텍처 변경 등)은 ADR(Architecture Decision Records) 문서로 남겨 "왜"를 추적합니다.
- **API 명세 자동화**: OpenAPI(Swagger) 또는 GraphQL 스키마를 통해 백엔드 변경 사항이 프론트엔드 타입 정의(Type Gen)에 자동 반영되도록 구성합니다.

## 15. 성능/접근성 모니터링

- **Core Web Vitals**: Lighthouse CI를 통해 LCP/FID/CLS 목표치를 추적하고 기준치 미달 시 빌드를 실패 처리합니다.
- **접근성**: `axe-core` 등을 Storybook/Playwright 단계에서 실행해 접근성 회귀를 예방합니다.

## 16. 코드 리뷰 문화 (Code Review)

- **명확한 구분**: 리뷰 시 'Nitpick(사소함)', 'Suggestion(제안)', 'Blocker(수정 필수)'를 태그로 구분하여 의도를 명확히 합니다.
- **작은 단위**: 하나의 PR은 가능한 한 500라인을 넘기지 않으며, 한 가지 기능/목적만 담아 리뷰 피로도를 낮춥니다.

## 17. React Compiler & Build 일관성

- **환경 일관성**: React Compiler나 Next/SWC 실험 옵션을 로컬·CI·배포 모두에서 동일하게 활성화하여 "로컬=CI=배포" 일관성을 확보합니다.
- **빠른 피드백**: 빌드 단계에서 옵션이 실패하면 CI가 바로 알려주도록 구성합니다.

## 18. CI 파이프라인 최적화

- **병렬 실행**: Lint/Test/Storybook/E2E 등을 병렬 단계로 나누고, 변경 파일에 따른 조건부 실행 규칙을 둡니다.
- **캐싱**: pnpm/Next build cache, Docker layer 등 CI 캐시를 적극 활용해 파이프라인 속도를 최적화합니다.
