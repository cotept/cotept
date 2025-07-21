# API 클라이언트 자동화 프로젝트 현황 및 로드맵

> **작성일**: 2025-01-21  
> **현재 상태**: 백엔드 API 명세 정확성 문제 해결 완료, 웹 프로젝트 적용 준비 단계

---

## 📚 **프로젝트 배경**

며칠 전부터 API 클라이언트 자동화를 구현하려는 시도가 계속되고 있었습니다. 기본 템플릿보다는 `apps/web/`에서 사용중인 실제 컨벤션과 코드로 자동화하고 싶어서 커스텀 템플릿 작업을 진행하려다 보니 다음과 같은 상황들을 발견하게 되었습니다:

1. **프론트엔드 코드 품질 문제**: 예시로만 만든 코드였고, 현재 팀원들과 열심히 만들었지만 코드리뷰 결과 형편없어서 그대로 쓰기 힘들다고 판단
2. **백엔드 API 명세 부정확성**: 실제 백엔드 API 명세가 정확하지 않았고 구조적으로 문제가 있었음
3. **일관성 부족**: 리팩토링 과정에서 더 많은 구조적 문제들을 발견

이러한 문제들을 해결하기 위해 **"기반부터 제대로 다시 구축"** 하는 접근을 선택했습니다.

---

## 🔄 **진행 과정 타임라인**

### **며칠 전**

- API 클라이언트 자동화 시도 시작
- 커스텀 템플릿 작업 계획 수립
- 기존 코드 품질 문제 발견

### **최근 며칠간**

- 프론트엔드 코드 리팩토링 진행
- 백엔드 API 명세 문제 확인
- [OAS_MASTER_PLAN.md](./OAS_MASTER_PLAN.md) 작성 (전체적인 비전과 계획)

### **오늘 (2025-01-21) - 🎉 대형 브레이크스루**

1. **Swagger + Interceptor 불일치 문제 해결**

   - HttpResponseInterceptor는 `ApiResponse<T>`로 래핑
   - Swagger 문서는 원본 DTO만 표시하는 불일치 발견
   - **커스텀 데코레이터 솔루션** 구현으로 완벽 해결

2. **Repository 리팩토링 완료 확인**

   - 모든 Repository가 BaseRepository 상속 완료
   - 의존성 주입 문제들 해결 (MailAuditPersistenceMapper 등)

3. **OpenAPI 스펙 정확성 확보**
   - MailRequestDto 타입 오류 수정 (`string | string[]` 처리)
   - 최종적으로 정확한 타입의 API 클라이언트 생성 성공

---

## 📊 **현재 상황 정리**

### ✅ **완료된 것들**

#### **1. 백엔드 API 명세 정확성**

- **문제**: HttpResponseInterceptor가 `ApiResponse<T>`로 래핑하는데 Swagger는 원본 DTO만 표시
- **해결**: 커스텀 데코레이터 (`@ApiOkResponseWrapper`, `@ApiOkResponseEmpty` 등) 구현
- **결과**: 실제 응답과 OpenAPI 문서가 완벽하게 일치

#### **2. Repository 아키텍처 통일**

- 모든 Repository가 BaseRepository 상속 완료
- 의존성 주입 문제들 해결
- 일관된 에러 처리, 트랜잭션, 페이징 구현

#### **3. OpenAPI 스펙 생성 성공**

- `packages/api-client/openapi-spec.yaml` 정확한 생성 확인
- 타입 안전성이 보장되는 API 클라이언트 자동 생성
- MailRequestDto의 `oneOf` 구조로 유연한 타입 지원

### 🚧 **다음 단계**

#### **1단계: Web 프로젝트 타입 적용 (1-2주)**

- `packages/api-client/src`의 생성된 타입을 web에서 사용
- 기존 하드코딩된 타입들을 생성된 타입으로 교체
- 실제 사용 패턴과 컨벤션 파악
- BaseApiService와의 통합 방식 검증

#### **2단계: 컨벤션 확립 (1주)**

- 어떤 구조가 가장 자연스러운지 확인
- 네이밍, 구조, 에러 처리 등 세부 컨벤션 정리
- 팀 내 합의를 통한 표준화

#### **3단계: 커스텀 템플릿 개발 (2-3주)**

- mustache 템플릿을 실제 컨벤션에 맞게 수정
- BaseApiService 상속 구조로 생성되도록 구현
- 기존 아키텍처와 완전 통합

#### **4단계: CI/CD 파이프라인 구축 (1-2주)**

- GitHub Actions 워크플로우 구현
- oasdiff를 통한 변경점 추적
- Slack/Notion 알림 연동

---

## 🛠️ **오늘의 기술적 성과**

### **커스텀 데코레이터 솔루션**

**문제 상황**:

```typescript
// 실제 런타임: HttpResponseInterceptor가 래핑
{ message: "성공", data: { id: "123", name: "홍길동" } }

// Swagger 문서: 원본 DTO만 표시
{ id: "123", name: "홍길동" }
```

**해결책**:

```typescript
// 기존
@ApiOkResponse({ type: UserResponseDto })

// 변경 후
@ApiOkResponseWrapper(UserResponseDto, "사용자 조회 성공")
```

**핵심 구현**:

```typescript
export const ApiOkResponseWrapper = <TModel extends Type<unknown>>(model: TModel, description?: string) => {
  return applyDecorators(
    ApiExtraModels(ApiResponse, model),
    ApiOkResponse({
      description: description || `The result of ${model.name}`,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          {
            properties: {
              data: { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
  )
}
```

### **최종 OpenAPI 스펙 결과**

```yaml
responses:
  "200":
    content:
      application/json:
        schema:
          allOf:
            - $ref: "#/components/schemas/ApiResponse"
            - properties:
                data:
                  $ref: "#/components/schemas/UserResponseDto"
```

---

## 🎯 **전략적 의의**

### **"기반부터 제대로" 접근의 성과**

1. **성급한 자동화 방지**: 잘못된 기반 위에 자동화를 구축했다면 나중에 더 큰 문제가 발생했을 것
2. **품질 우선**: 단기적 편의성보다 장기적 안정성 선택
3. **점진적 발전**: 실제 사용 → 컨벤션 정리 → 자동화 순서로 안전한 진행

### **기존 OAS_MASTER_PLAN.md와의 연결**

- [OAS_MASTER_PLAN.md](./OAS_MASTER_PLAN.md)에서 계획했던 **B안(기존 아키텍처와 통합)** 이 올바른 선택이었음을 확인
- 이제 기술적 기반이 탄탄해져서 본격적인 자동화 구현이 가능한 상태
- GitHub Actions, 협업 도구 연동 등 고도화된 기능들을 안전하게 추가할 수 있음

---

## 🚀 **다음 세션 계획**

### **우선순위 1: 생성된 타입 실제 적용**

- Web 프로젝트에서 `@repo/api-client` 패키지 사용
- 기존 수작업 API 호출 코드들을 생성된 타입으로 교체
- 실제 사용성 검증

### **우선순위 2: 사용 패턴 분석**

- 어떤 방식이 가장 자연스러운지 확인
- BaseApiService와의 통합에서 발생하는 이슈들 파악
- 팀 워크플로우에 맞는 구조 설계

### **우선순위 3: 컨벤션 문서화**

- 확립된 패턴을 바탕으로 코딩 컨벤션 정리
- 커스텀 템플릿 개발을 위한 구체적 명세 작성

---

## 💭 **회고**

며칠간의 여정이 "API 클라이언트 자동화"라는 단순한 목표에서 시작되었지만, 결국 **프로젝트 전체의 아키텍처 품질을 한 단계 끌어올리는 결과**로 이어졌습니다.

특히 오늘 해결한 "Swagger + Interceptor 불일치" 문제는 많은 NestJS 프로젝트에서 겪는 공통적인 이슈였는데, 커스텀 데코레이터라는 깔끔한 해결책을 찾아낸 것이 큰 성과입니다.

이제 진짜 자동화의 가치를 발휘할 수 있는 탄탄한 기반이 마련되었습니다! 🎉
