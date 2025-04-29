# RBAC+ABAC 사용 예시

본 문서는 코테피티 서비스에서 RBAC+ABAC 권한 관리 시스템을 활용하는 방법에 대한 예시를 제공합니다.

## 컨트롤러에서의 사용 예시

```typescript
// src/modules/mentoring/interface/controllers/session.controller.ts
import { Controller, Get, Post, Param, Body, UseGuards } from "@nestjs/common"
import { JwtAuthGuard } from "../../../auth/application/guards/jwt-auth.guard"
import { PermissionGuard } from "../../../auth/application/guards/permission.guard"
import { RequiresPermission } from "../../../auth/application/decorators/requires-permission.decorator"

@Controller("sessions")
export class SessionController {
  /**
   * 세션 상세 조회
   * - 세션 소유자(멘토)이거나 참가자(멘티)인 경우만 조회 가능
   */
  @Get(":id")
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequiresPermission("SESSION", "READ")
  async getSession(@Param("id") id: string) {
    // 권한이 있는 경우에만 실행됨
    return this.sessionService.findById(id)
  }

  /**
   * 세션 생성
   * - 멘토 자격 검증이 완료된 사용자만 생성 가능
   */
  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequiresPermission("SESSION", "CREATE")
  async createSession(@Body() createSessionDto: any) {
    // 권한이 있는 경우에만 실행됨
    return this.sessionService.create(createSessionDto)
  }

  /**
   * 세션 참가
   * - 세션 참가자(멘티)이거나 소유자(멘토)인 경우만 참가 가능
   * - 세션이 SCHEDULED 또는 IN_PROGRESS 상태여야 함
   */
  @Post(":id/join")
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequiresPermission("SESSION", "JOIN")
  async joinSession(@Param("id") id: string, @Body() joinSessionDto: any) {
    // 권한이 있는 경우에만 실행됨
    return this.sessionService.join(id, joinSessionDto)
  }
}
```

## 작동 방식 설명

1. **@RequiresPermission 데코레이터**:
   컨트롤러 메소드에 `@RequiresPermission` 데코레이터를 추가하여 필요한 리소스 타입과 작업을 지정합니다.

2. **PermissionGuard**:
   `@UseGuards` 데코레이터에 `PermissionGuard`를 추가하여 권한 검사를 활성화합니다.
3. **권한 평가 프로세스**:

   - 가드는 데코레이터에서 지정한 리소스 타입과 작업을 읽습니다.
   - 요청 경로 매개변수, 쿼리 또는 본문에서 리소스 ID를 추출합니다.
   - 사용자 ID, 리소스 타입, 리소스 ID, 작업을 `PolicyEvaluationService.isAllowed` 메소드에 전달합니다.
   - 서비스는 적용 가능한 정책을 평가하고 접근 허용 여부를 결정합니다.

4. **속성 평가**:
   `AttributeEvaluationService`는 다양한 속성을 평가합니다:
   - 사용자가 세션의 소유자인지 (`isSessionOwner`)
   - 세션 상태가 적절한지 (`sessionStatus`)
   - 사용자가 구독 중인지 (`hasActiveSubscription`)
   - 등등

## 정책 정의 예시

```sql
-- 정책 생성
INSERT INTO POLICIES (policy_id, name, description, priority, active, action_type, resource_type, operation)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'SessionJoinPolicy',
  '멘토링 세션 참가 권한 정책',
  10,
  1,
  'ALLOW',
  'SESSION',
  'JOIN'
);

-- 정책 조건 설정
INSERT INTO POLICY_ATTRIBUTE_CONDITIONS (condition_id, policy_id, attribute_id, operator, value_boolean, target_type)
VALUES (
  '9a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
  '550e8400-e29b-41d4-a716-446655440000',
  '33ccdd44-5566-7788-99aa-bbccddeeff00', -- isSessionOwner 속성 ID
  'EQUALS',
  1,
  'CONTEXT'
);

INSERT INTO POLICY_ATTRIBUTE_CONDITIONS (condition_id, policy_id, attribute_id, operator, value_string, target_type)
VALUES (
  'a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6',
  '550e8400-e29b-41d4-a716-446655440000',
  '44ddee55-6677-8899-aabb-ccddeeff0011', -- sessionStatus 속성 ID
  'IN',
  'SCHEDULED,IN_PROGRESS',
  'RESOURCE'
);
```

## 역할 정책 연결 예시

```sql
-- 역할에 정책 연결 (RBAC와 ABAC 통합)
INSERT INTO ROLE_POLICIES (role_policy_id, role, policy_id)
VALUES (
  'ff00ee11-dd22-cc33-bb44-aa5599887766',
  'MENTOR',
  '550e8400-e29b-41d4-a716-446655440000'
);

INSERT INTO ROLE_POLICIES (role_policy_id, role, policy_id)
VALUES (
  'aa00bb11-cc22-dd33-ee44-ff5566778899',
  'MENTEE',
  '550e8400-e29b-41d4-a716-446655440000'
);
```

이러한 방식으로 RBAC와 ABAC를 통합하여 코테피티 서비스의 다양한 기능에 대한 세밀한 권한 제어를 구현할 수 있습니다.

// 비밀번호 객체 생성
const password = Password.create(rawPassword);

try {
// 가능한 빨리 해싱 처리
const passwordHash = await passwordService.hashPassword(password.getValue());

// 해싱된 값으로 사용자 생성
const user = new User({
email: email,
passwordHash: passwordHash,
// ...기타 필드들...
});

// 저장 등 작업 수행
return userRepository.create(user);
} finally {
// 작업 완료 후 반드시 비밀번호 객체 폐기
password.dispose();
}
