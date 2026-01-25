# UseCase별 예외 분석 및 API 응답 매핑

## 개요
각 UseCase에서 발생할 수 있는 예외들을 분석하고, 이들이 HTTP 상태 코드와 어떻게 매핑되는지 문서화합니다.

## 분석 결과

### 1. User Module

#### CreateUserUseCaseImpl
**발생 가능한 예외:**
- `ConflictException`: 이메일 중복 시 (line 32)
- `BadRequestException`: 값 객체 생성 실패 시 (Email.of, Name.of, PhoneNumber.of)
- `InternalServerErrorException`: 데이터베이스 저장 실패

**API 매핑:**
- `ConflictException` → 409 Conflict
- `BadRequestException` → 400 Bad Request
- `InternalServerErrorException` → 500 Internal Server Error

#### UpdateUserUseCaseImpl
**발생 가능한 예외:**
- `NotFoundException`: 사용자가 존재하지 않는 경우 (line 29)
- `BadRequestException`: 값 객체 생성 실패 시
- `InternalServerErrorException`: 데이터베이스 업데이트 실패

**API 매핑:**
- `NotFoundException` → 404 Not Found
- `BadRequestException` → 400 Bad Request
- `InternalServerErrorException` → 500 Internal Server Error

### 2. Auth Module

#### LoginUseCaseImpl
**발생 가능한 예외:**
- `UnauthorizedException`: 잘못된 자격 증명 (line 39, 45)
- `UnauthorizedException`: 계정이 활성화되지 않음 (line 50)
- `InternalServerErrorException`: 토큰 생성/저장 실패

**API 매핑:**
- `UnauthorizedException` → 401 Unauthorized
- `InternalServerErrorException` → 500 Internal Server Error

### 3. Baekjoon Module

#### StartVerificationUseCaseImpl
**발생 가능한 예외:**
- `ConflictException`: Rate limit 초과 (line 74)
- `BadRequestException`: 잘못된 입력값 (line 91)
- `RequestTimeoutException`: 세션 만료 (line 110)
- `ConflictException`: 진행 중인 세션 존재 (line 114)
- `ConflictException`: 핸들 중복 사용 (line 124)
- `BadRequestException`: 예상치 못한 에러 (line 185)

**외부 API 예외 (SolvedAcHttpClient):**
- 404 → "사용자를 찾을 수 없습니다"
- 429 → "API 호출 한도를 초과했습니다"
- 500+ → "solved.ac 서버에 일시적인 문제가 발생했습니다"

**API 매핑:**
- `ConflictException` → 409 Conflict
- `BadRequestException` → 400 Bad Request
- `RequestTimeoutException` → 408 Request Timeout
- Solved.ac 404 → 404 Not Found
- Solved.ac 429 → 429 Too Many Requests
- Solved.ac 500+ → 503 Service Unavailable

### 4. Mail Module

#### SendMailUseCaseImpl
**발생 가능한 예외:**
- 메일 서비스 예외 (MailerService 내부)
- 템플릿 처리 오류
- 네트워크 연결 실패

**잠재적 API 매핑:**
- 메일 서비스 실패 → 503 Service Unavailable
- 잘못된 템플릿/데이터 → 400 Bad Request
- Rate limiting → 429 Too Many Requests

## 주요 발견 사항

### 1. 예외 처리 패턴 일관성
- Auth UseCase는 표준 NestJS 예외 + 도메인 에러 메시지 사용 (개선됨)
- User UseCase는 표준 NestJS 예외 사용
- Baekjoon UseCase는 복합적 예외 처리 (비즈니스 + 외부 API)
- Mail UseCase는 기본적인 예외 처리만 구현

### 2. 외부 시스템 예외 변환
- SolvedAcHttpClient는 HTTP 상태 코드를 적절히 변환
- 하지만 Mail Service는 외부 예외를 그대로 전파

### 3. 개선이 필요한 영역

#### Mail Module 예외 처리 강화
```typescript
// 현재: 기본적인 로깅만
catch (error) {
  this.logger.error(`메일 전송 실패: ${recipients}: ${ErrorUtils.getErrorMessage(error)}`)
  throw error
}

// 개선안: 적절한 예외 변환
catch (error) {
  if (error.code === 'ECONNREFUSED') {
    throw new ServiceUnavailableException('메일 서비스를 사용할 수 없습니다')
  }
  if (error.code === 'ETIMEDOUT') {
    throw new RequestTimeoutException('메일 전송 시간이 초과되었습니다')
  }
  throw new InternalServerErrorException('메일 전송 중 오류가 발생했습니다')
}
```

#### 통일된 Rate Limiting 예외
- 현재 각 모듈별로 다른 메시지
- 공통 Rate Limiting 예외 클래스 도입 고려

#### 외부 API 타임아웃 처리
- 모든 외부 API 호출에 일관된 타임아웃 처리
- 재시도 로직 표준화

## 권장 개선 사항

### 1. 공통 예외 변환 유틸리티
```typescript
export class ExceptionTransformer {
  static fromDatabaseError(error: Error): HttpException {
    // 데이터베이스 에러를 적절한 HTTP 예외로 변환
  }
  
  static fromExternalApiError(error: AxiosError): HttpException {
    // 외부 API 에러를 적절한 HTTP 예외로 변환
  }
}
```

### 2. 도메인별 예외 기본 클래스
```typescript
export abstract class UserDomainException extends HttpException {
  constructor(message: string, status: HttpStatus) {
    super(message, status)
  }
}

export class UserNotFoundDomainException extends UserDomainException {
  constructor(userId: string) {
    super(`사용자 ${userId}를 찾을 수 없습니다`, HttpStatus.NOT_FOUND)
  }
}
```

### 3. UseCase별 예외 문서화 표준
각 UseCase 클래스의 JSDoc에 발생 가능한 예외를 명시:
```typescript
/**
 * @throws {ConflictException} 이메일이 이미 사용 중인 경우
 * @throws {BadRequestException} 비밀번호 정책을 위반하는 경우
 * @throws {InternalServerErrorException} 데이터베이스 저장 실패
 */
async execute(createUserDto: CreateUserDto): Promise<UserDto>
```

## 결론
현재 대부분의 UseCase는 적절한 예외 처리를 구현하고 있으나, Mail Module과 일부 외부 API 연동 부분에서 개선이 필요합니다. 특히 예외 변환의 일관성과 문서화를 강화하면 API 사용자 경험을 크게 개선할 수 있습니다.