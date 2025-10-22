# NestJS Swagger 제네릭 및 데코레이터 사용 가이드

## 🎯 개요

NestJS에서 Swagger(OpenAPI)를 사용할 때 제네릭 타입을 올바르게 문서화하는 방법과 최적의 데코레이터 사용법을 정리합니다. 이 가이드는 기본적인 allOf 패턴부터 고급 Mixin 패턴까지 다양한 접근 방식을 다룹니다.

## 🚨 핵심 문제

**TypeScript 리플렉션이 제네릭과 작동하지 않는 문제:**

- `nestjs/swagger`는 TypeScript 리플렉션을 사용
- 런타임에 제네릭 타입 정보가 소실됨
- `ApiResponse<T>`가 단순히 `object`로 변환됨

## 🔧 해결 방안들

> **💡 방법 선택 가이드**
>
> - **간단한 응답**: 직접 타입 반환 + 인터셉터
> - **표준화된 응답**: allOf 패턴 데코레이터
> - **복잡한 제네릭**: Mixin 패턴
> - **대규모 프로젝트**: Mixin + 표준 데코레이터 조합

### 1. 기본 ApiResponse 데코레이터 사용법

#### ❌ 잘못된 방법

```typescript
@Controller("users")
export class UserController {
  @Get()
  @ApiResponse({ status: 200, description: "사용자 목록 조회" })
  getUsers(): ApiResponse<User[]> {
    // 타입 정보가 OpenAPI에서 소실됨
  }
}
```

#### ✅ 올바른 방법

```typescript
@Controller("users")
export class UserController {
  @Get()
  @ApiResponse({
    status: 200,
    description: "사용자 목록 조회",
    type: [User], // 명시적 타입 지정
  })
  getUsers(): User[] {
    // 직접 타입 반환, 인터셉터에서 래핑
  }
}
```

### 2. @ApiExtraModels와 allOf 패턴 (고급)

#### 제네릭 응답 래퍼 데코레이터 생성

```typescript
import { applyDecorators, Type } from "@nestjs/common"
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger"

export const ApiOkResponseWrapper = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
  description: string = "성공적으로 처리됨",
) =>
  applyDecorators(
    ApiExtraModels(ApiResponseDto, dataDto),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: {
                $ref: getSchemaPath(dataDto),
              },
            },
          },
        ],
      },
    }),
  )
```

#### 페이지네이션 응답 데코레이터

```typescript
export const ApiOkResponsePaginated = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
  description: string = "페이지네이션 결과",
) =>
  applyDecorators(
    ApiExtraModels(PaginatedResponseDto, dataDto),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResponseDto) },
          {
            properties: {
              data: {
                type: "array",
                items: { $ref: getSchemaPath(dataDto) },
              },
            },
          },
        ],
      },
    }),
  )
```

### 3. 컨트롤러에서 사용법

#### 기본 allOf 패턴 사용

```typescript
@Controller("users")
export class UserController {
  @Get()
  @ApiOkResponseWrapper(UserResponseDto, "사용자 목록 조회 성공")
  async getUsers(): Promise<UserResponseDto[]> {
    return this.userService.findAll()
  }

  @Get("paginated")
  @ApiOkResponsePaginated(UserResponseDto, "페이지네이션된 사용자 목록")
  async getUsersPaginated(@Query() query: PaginationQueryDto): Promise<UserResponseDto[]> {
    return this.userService.findPaginated(query)
  }

  @Get(":id")
  @ApiOkResponseWrapper(UserResponseDto, "사용자 상세 조회 성공")
  async getUserById(@Param("id") id: string): Promise<UserResponseDto> {
    return this.userService.findById(id)
  }
}
```

#### Mixin 패턴 활용

````typescript
@Controller('users')
export class UserController {
  @Get('list')
  @ApiOkResponse({ type: withPaginationResponse(UserResponseDto) })
  async getUserList(@Query() query: PaginationQueryDto) {
    const result = await this.userService.findPaginated(query);
    return {
      list: result.data,
      page: query.page,
      totalPage: Math.ceil(result.totalCount / query.limit),
      totalCount: result.totalCount
    };
  }

  @Get('posts/:id')
  @ApiOkResponse({ type: withListResponse(PostResponseDto, { hasPagination: true }) })
  async getUserPosts(@Param('id') userId: string, @Query() query: PaginationQueryDto) {
    return this.userService.getUserPosts(userId, query);
  }
}

## 📋 Base DTO 정의

### ApiResponse 기본 구조
```typescript
export class ApiResponseDto {
  @ApiProperty({ description: '응답 메시지', example: '성공적으로 처리되었습니다.' })
  message?: string;

  @ApiProperty({ description: '응답 데이터' })
  data?: any; // 실제로는 allOf로 override됨
}
````

### 페이지네이션 응답 구조

```typescript
export class PaginatedResponseDto {
  @ApiProperty({ description: "응답 메시지" })
  message?: string

  @ApiProperty({ description: "페이지네이션된 데이터" })
  data?: any[] // 실제로는 allOf로 override됨

  @ApiProperty({ description: "전체 항목 수", example: 100 })
  totalCount: number

  @ApiProperty({ description: "현재 오프셋", example: 0 })
  offset: number

  @ApiProperty({ description: "페이지 크기", example: 10 })
  limit: number
}
```

## 🔄 생성되는 OpenAPI 스키마

### allOf 패턴 결과

```yaml
UserController_getUsers_200_response:
  allOf:
    - $ref: "#/components/schemas/ApiResponseDto"
    - type: object
      properties:
        data:
          $ref: "#/components/schemas/UserResponseDto"
```

### 페이지네이션 결과

```yaml
UserController_getUsersPaginated_200_response:
  allOf:
    - $ref: "#/components/schemas/PaginatedResponseDto"
    - type: object
      properties:
        data:
          type: array
          items:
            $ref: "#/components/schemas/UserResponseDto"
```

## 🎨 고급 패턴들

### 1. 다중 상태 코드 처리

```typescript
export const ApiResponses = <DataDto extends Type<unknown>>(dataDto: DataDto) =>
  applyDecorators(
    ApiOkResponseWrapper(dataDto, "성공"),
    ApiBadRequestResponse({ description: "잘못된 요청" }),
    ApiUnauthorizedResponse({ description: "인증 필요" }),
    ApiNotFoundResponse({ description: "리소스를 찾을 수 없음" }),
  )
```

### 2. 에러 응답 표준화

```typescript
export class ErrorResponseDto {
  @ApiProperty({ description: "HTTP 상태 코드", example: 400 })
  statusCode: number

  @ApiProperty({ description: "에러 메시지", example: "잘못된 요청입니다." })
  message: string

  @ApiProperty({ description: "에러 코드", example: "VALIDATION_ERROR" })
  code?: string

  @ApiProperty({ description: "에러 상세 정보" })
  details?: any[]
}
```

### 3. Mixin 패턴을 활용한 동적 DTO 생성

#### 기본 Mixin 패턴

```typescript
import { mixin, Type } from "@nestjs/common"
import { ApiProperty } from "@nestjs/swagger"

export interface Constructor<T = any> {
  new (...args: any[]): T
}

export function withPaginationResponse<T extends Constructor>(Base: T) {
  class PaginationResponseDto {
    @ApiProperty({ type: [Base] })
    list!: InstanceType<T>[]

    @ApiProperty({ description: "현재 페이지", example: 1 })
    page!: number

    @ApiProperty({ description: "전체 페이지 수", example: 10 })
    totalPage!: number

    @ApiProperty({ description: "전체 항목 수", example: 100 })
    totalCount!: number
  }

  return mixin(PaginationResponseDto)
}
```

#### 고급 Mixin - 다중 응답 타입 지원

```typescript
export function withListResponse<T extends Constructor>(
  Base: T,
  options: {
    hasPagination?: boolean
    hasMetadata?: boolean
  } = {},
) {
  class BasicListResponseDto {
    @ApiProperty({ type: [Base] })
    data!: InstanceType<T>[]

    @ApiProperty({ description: "응답 메시지" })
    message?: string
  }

  if (options.hasPagination) {
    class PaginatedListResponseDto extends BasicListResponseDto {
      @ApiProperty({ description: "페이지네이션 정보" })
      pagination!: {
        page: number
        limit: number
        totalCount: number
        totalPage: number
      }
    }
    return mixin(PaginatedListResponseDto)
  }

  if (options.hasMetadata) {
    class MetadataListResponseDto extends BasicListResponseDto {
      @ApiProperty({ description: "추가 메타데이터" })
      metadata!: Record<string, any>
    }
    return mixin(MetadataListResponseDto)
  }

  return mixin(BasicListResponseDto)
}
```

### 4. 조건부 응답 래퍼

```typescript
export const ApiConditionalResponse = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
  options: {
    isPaginated?: boolean
    hasError?: boolean
    description?: string
  } = {},
) => {
  const decorators = []

  if (options.isPaginated) {
    decorators.push(ApiOkResponsePaginated(dataDto, options.description))
  } else {
    decorators.push(ApiOkResponseWrapper(dataDto, options.description))
  }

  if (options.hasError) {
    decorators.push(ApiBadRequestResponse({ type: ErrorResponseDto }), ApiNotFoundResponse({ type: ErrorResponseDto }))
  }

  return applyDecorators(...decorators)
}
```

## 🚀 최선의 방법 (Best Practices)

### 1. 일관된 데코레이터 사용

- 프로젝트 전체에서 동일한 응답 래퍼 패턴 사용
- 표준화된 에러 응답 구조 유지
- 명확한 데코레이터 네이밍 규칙 적용

### 2. 타입 안전성 확보

```typescript
// 런타임 타입 체크와 함께
@Post()
@ApiOkResponseWrapper(CreateUserResponseDto)
async createUser(@Body() dto: CreateUserRequestDto): Promise<CreateUserResponseDto> {
  const result = await this.userService.create(dto);
  // 인터셉터에서 ApiResponse로 자동 래핑
  return result;
}
```

### 3. 문서화 품질 향상

```typescript
@ApiTags("사용자 관리")
@Controller("users")
@ApiSecurity("bearer")
export class UserController {
  @Get()
  @ApiOperation({
    summary: "사용자 목록 조회",
    description: "등록된 모든 사용자를 조회합니다. 페이지네이션을 지원합니다.",
  })
  @ApiOkResponsePaginated(UserResponseDto, "사용자 목록 조회 성공")
  @ApiQuery({ name: "page", required: false, type: Number, description: "페이지 번호" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "페이지 크기" })
  async getUsers(@Query() query: PaginationQueryDto) {
    return this.userService.findPaginated(query)
  }
}
```

## ⚠️ 주의사항

1. **@ApiExtraModels는 필수**: `getSchemaPath`가 작동하려면 모든 모델이 등록되어야 함
2. **순환 참조 주의**: 복잡한 상속 구조에서 순환 참조 발생 가능
3. **성능 고려**: 너무 많은 `allOf` 중첩은 성능에 영향
4. **타입 검증**: 런타임에서 실제 반환 타입과 문서화된 타입이 일치하는지 확인 필요

## 🔍 트러블슈팅

### 문제: `getSchemaPath`가 빈 문자열 반환

**해결**: 해당 모델이 어디서도 사용되지 않는 경우 발생. `@ApiExtraModels`로 명시적 등록 필요

### 문제: allOf가 올바르게 작동하지 않음

**해결**: 기본 스키마와 override 스키마의 속성명이 정확히 일치하는지 확인

### 문제: 복잡한 제네릭 타입이 정상 생성되지 않음

**해결**: 단순한 구조로 분해하거나 mixin 패턴 사용

### 문제: Mixin으로 생성된 DTO에서 타입 추론이 제대로 되지 않음

**해결**:

1. `InstanceType<T>` 사용으로 올바른 타입 추론 확보
2. 컨트롤러에서 명시적 반환 타입 선언

```typescript
async getUsers(): Promise<InstanceType<ReturnType<typeof withPaginationResponse<typeof UserDto>>>> {
  // 구현
}
```

### 문제: 동적으로 생성된 DTO가 Swagger UI에서 제대로 표시되지 않음

**해결**:

1. `@ApiProperty` 데코레이터를 제네릭 필드에서 제거
2. 수동으로 스키마 정의 제공
3. `@ApiExtraModels`에 모든 관련 모델 등록

## 💡 실제 프로젝트 적용 팁

### 1. 점진적 마이그레이션 전략

```typescript
// 기존 방식 (단계적으로 교체)
@ApiResponse({ status: 200, type: [UserDto] })

// 새로운 방식 (allOf 패턴)
@ApiOkResponseWrapper(UserDto)

// 최신 방식 (Mixin 패턴)
@ApiOkResponse({ type: withPaginationResponse(UserDto) })
```

### 2. 팀 내 컨벤션 설정

- 일관된 네이밍 규칙: `withXXXResponse`, `ApiXXXResponseWrapper`
- 표준 응답 구조 통일: 메시지, 데이터, 메타데이터 필드명
- 에러 응답 표준화

### 3. 성능 최적화

- 자주 사용되는 Mixin DTO는 미리 생성하여 재사용
- 복잡한 allOf 구조보다는 단순한 Mixin 패턴 선호
- 불필요한 `@ApiExtraModels` 등록 최소화

---

이 가이드를 통해 NestJS에서 Swagger 제네릭 타입을 올바르게 구현하고 문서화할 수 있습니다. 프로젝트 특성에 맞게 패턴을 조정하여 사용하세요.
