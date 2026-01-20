# Next-Auth 인증 구현 분석 리포트

## 1. 개요 (Overview)

`apps/web`에 구현된 Next-Auth 기반 인증 시스템은 전반적으로 현대적인 웹 애플리케이션의 표준적인 패턴을 잘 따르고 있습니다. JWT 기반의 세션 관리, Credentials Provider를 통한 자체 로그인, React Query를 활용한 비동기 상태 관리, Axios 인터셉터를 통한 토큰 주입 등 체계적으로 구현되어 있습니다.

본 리포트는 현재 구현 코드의 강점과 더불어, 확장성, 응집성, 책임 분리 원칙에 입각한 개선점을 제안합니다.

## 2. 잘 구현된 점 (Strengths)

### 가. 뛰어난 모듈화 및 책임 분리 (High Cohesion & Separation of Concerns)

- **도메인 기반 구조**: 인증 관련 로직이 `features/auth`, `shared/auth` 등으로 명확히 분리되어 있습니다. UI 컴포넌트, React Hook, API 호출, 상태 관리 로직이 각자의 역할을 충실히 수행하며 응집도가 높습니다.
- **중앙화된 설정**: `auth.ts` 파일에 Next-Auth 관련 설정이 중앙화되어 있어 관리가 용이합니다. `callbacks.ts`, `providers/credentials.ts` 등으로 로직을 분리한 구조는 가독성과 유지보수성을 높입니다.
- **Validation 분리**: `zod`를 사용하여 인증 관련 유효성 검사 규칙(`auth-rules.ts`)을 별도로 정의하여, UI 로직과 비즈니스 규칙의 분리를 성공적으로 달성했습니다.

### 나. 강력한 클라이언트 상태 관리 (Robust Client-State Management)

- **TanStack Query 통합**: `features/auth/apis`에서 `useMutation`, `useQuery`를 사용하여 API와의 상호작용을 관리하는 방식은 매우 훌륭합니다. 이를 통해 로딩/에러 상태, 캐싱, 자동 리프레시 등을 손쉽게 처리할 수 있습니다.
- **`useBaseMutation` 추상화**: `toast` 알림, 쿼리 무효화(`invalidateQueries`) 등 뮤테이션의 공통 부수 효과를 `useBaseMutation`이라는 커스텀 훅으로 추상화하여 코드 중복을 최소화하고 일관성을 유지했습니다.
- **세션-상태 동기화**: `useLogout`, `useRefreshToken` 등의 훅에서 `signOut`, `update`와 같은 Next-Auth 함수를 호출하여, 서버 API 상태와 클라이언트의 Next-Auth 세션 상태를 동기화하는 로직이 명확하게 구현되어 있습니다.

### 다. 자동화된 API 요청 및 에러 처리 (Automated API Requests & Error Handling)

- **Axios 인터셉터**: `shared/api/core/axios.ts`의 요청 인터셉터는 모든 API 호출에 자동으로 `Authorization` 헤더(Access Token)를 주입합니다. 이는 API 호출 코드를 매우 깔끔하게 유지시켜주는 좋은 패턴입니다.
- **자동 토큰 갱신**: 응답 인터셉터에서 401 에러 발생 시, Refresh Token을 사용해 Access Token을 자동으로 갱신하고 원래 요청을 재시도하는 로직이 구현되어 있어 사용자 경험을 크게 향상시킵니다.
- **일관된 에러 처리**: `ApiErrorHandler` 클래스를 통해 Axios 에러를 포함한 모든 종류의 에러를 일관되게 처리하고, `useBaseMutation`과 연계하여 사용자에게 피드백(toast)을 제공하는 흐름이 체계적입니다.

### 라. 타입 안전성 (Type Safety)

- **TypeScript 기반**: `next-auth.d.ts` 파일을 통해 `Session`, `User`, `JWT` 객체를 프로젝트의 커스텀 타입(`CotePtUser`)으로 확장하여, 세션 객체 전반에 걸쳐 타입 안전성을 확보했습니다.
- **Zod 활용**: `credentials.ts`와 회원가입/로그인 폼에서 `zod` 스키마를 사용하여 런타임 유효성 검사와 타입 추론을 동시에 해결했습니다.

## 3. 개선 제안 (Areas for Improvement)

### 가. 로그인 흐름의 이중화 (Duplicated Login Flow)

- **문제점**: 현재 두 가지 방식의 로그인 흐름이 공존합니다.
  1.  `features/auth/actions/signin.ts`: `useFormState`와 함께 사용하는 **서버 액션** 기반 로그인.
  2.  `features/auth/apis/mutations.ts`: `useLogin` 훅을 사용하는 **클라이언트 사이드** API 호출 기반 로그인.
- **영향**: 코드의 단일 책임 원칙(SRP)을 저해하고, 유지보수 시 혼란을 야기할 수 있습니다. `SignInForm`은 서버 액션을 사용하고 있지만, `useLogin` 훅은 현재 사용되지 않는 것으로 보여 레거시 코드일 가능성이 있습니다.
- **개선 제안**: **서버 액션 기반의 `signInAction`을 표준 로그인 방식으로 채택**하고, `useLogin` 훅은 리팩토링하거나 사용처가 없다면 제거하여 로그인 흐름을 하나로 통일하는 것을 권장합니다. 이는 Next.js App Router의 철학에도 더 부합합니다.

### 나. 미들웨어 확장성 (Middleware Scalability)

- **문제점**: `middleware.ts`에서 보호할 경로를 `const protectedRoutes = ["/protected"]`와 같이 하드코딩된 배열로 관리하고 있습니다.
- **영향**: 애플리케이션 규모가 커지고 보호할 경로가 많아지면 이 배열을 수동으로 관리하기가 번거롭고 실수가 발생하기 쉽습니다.
- **개선 제안**: 다음과 같이 미들웨어의 확장성을 개선할 수 있습니다.
  - **경로 규칙 기반**: `/dashboard/:path*`, `/settings/:path*` 와 같이 특정 패턴의 모든 하위 경로를 보호하도록 `matcher`를 활용합니다.
  - **컨벤션 기반**: `(protected)`와 같은 라우트 그룹을 만들어, 해당 그룹 내의 모든 페이지를 자동으로 보호하는 규칙을 적용합니다.

### 다. 사소한 코드 품질 및 일관성 (Minor Code Quality & Consistency)

- **`console.log` 제거**: `credentials.ts`와 `middleware.ts` 등 운영 환경에 배포될 수 있는 코드에 `console.log`가 남아있습니다. 빌드 시 자동으로 제거하는 설정을 추가하거나 수동으로 제거해야 합니다.
- **타입 캐스팅**: `callbacks.ts`의 `jwt` 콜백에서 `user as any`와 같이 `any` 캐스팅이 사용되었습니다. `auth.d.ts`에 타입이 잘 정의되어 있으므로, `any` 대신 명확한 타입을 사용하여 캐스팅을 제거하는 것이 안전합니다.
- **Provider 설정 불일치**: `callbacks.ts`의 `signIn` 콜백에는 `google`, `github` provider가 언급되지만, `auth.ts`의 `providers` 배열에는 `credentialsProvider`만 포함되어 있습니다. 실제 사용하지 않는다면 콜백에서 관련 코드를 제거하고, 사용할 계획이라면 `providers` 배열에 추가하여 설정을 일치시켜야 합니다.

### 라. 사용자 경험 (User Experience)

- **짧은 세션 유효기간**: `auth.ts`에 설정된 JWT `maxAge`가 `30 * 60` (30분)으로 비교적 짧습니다. 자동 토큰 갱신 로직이 잘 구현되어 있지만, 네트워크가 불안정한 환경이나 사용자가 장시간 자리를 비운 경우 예기치 않은 로그아웃이 발생할 수 있습니다. 서비스의 특성을 고려하여 세션 유효기간을 8시간 또는 1일 등으로 늘리는 것을 검토해볼 수 있습니다.

## 4. 종합 평가 (Overall Assessment)

현재의 Next-Auth 인증 구현은 매우 견고하고 잘 설계된 구조를 갖추고 있습니다. 특히, **모듈화, React Query와의 통합, 자동화된 토큰 관리** 부분은 높은 수준의 코드 품질을 보여줍니다.

위에 제안된 몇 가지 개선점(로그인 흐름 단일화, 미들웨어 확장성 확보 등)을 반영한다면, 코드의 유지보수성과 확장성이 더욱 향상되어 장기적으로 더 안정적인 시스템으로 발전할 수 있을 것입니다. 훌륭한 기반 위에 약간의 다듬기를 더하는 과정이라고 볼 수 있습니다.
