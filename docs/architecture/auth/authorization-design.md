# 인가(Authorization) 시스템 아키텍처 설계

## 1. 설계 원칙 및 철학

본 설계는 **확장성(Scalability)**, **유지보수성(Maintainability)**, **일관성(Consistency)**을 핵심 가치로 둡니다.
단순한 RBAC(Role-Based Access Control)로 시작하되, 향후 ABAC(Attribute-Based Access Control)로의 진화를 고려하여 설계합니다.

### 핵심 원칙 (SOLID & DRY)
1.  **Single Source of Truth (DRY)**: 권한 정책(Policy)은 오직 **`@packages/common-lib`** 한 곳에서만 정의합니다. 프론트엔드와 백엔드는 이 정책을 참조만 합니다.
2.  **Separation of Concerns (SoC)**:
    *   **정책 정의 (Policy Definition)**: 누가 무엇을 할 수 있는가? (`common-lib`)
    *   **정책 집행 (Policy Enforcement)**: 현재 사용자가 이 행동을 해도 되는가? (`Web Middleware`, `NestJS Guard`)
3.  **Open-Closed Principle (OCP)**: 새로운 역할이나 리소스가 추가되어도, 검증 로직(`can()` 함수 등)은 수정되지 않고 설정(Configuration)만 확장됩니다.
4.  **Dependency Inversion (DIP)**: 비즈니스 로직은 구체적인 '경로'나 '데이터베이스'가 아니라, 추상화된 '권한(Permission)'에 의존합니다.

---

## 2. 아키텍처 개요

```mermaid
graph TD
    subgraph "Layer 1: Policy Definition (@packages/common-lib)"
        Roles[UserRole Enum]
        Resources[Resource Enum]
        Actions[Action Enum]
        Policy[Permission Policy Map]
        Ability[Pure Function: can(role, action, resource)]
    end

    subgraph "Layer 2: Identity (Authentication)"
        NextAuth[NextAuth Session] -->|Provides role| WebApp
        Passport[Passport Strategy] -->|Provides role| ApiApp
    end

    subgraph "Layer 3: Policy Enforcement (Web)"
        Middleware[Next.js Middleware] -->|Checks URL| Ability
        Components[React Components] -->|Checks UI Element| Ability
    end

    subgraph "Layer 4: Policy Enforcement (API)"
        Guard[NestJS RolesGuard] -->|Checks Handler| Ability
    end

    Roles --> Policy
    Resources --> Policy
    Actions --> Policy
    Policy --> Ability
```

---

## 3. 구현 상세: `@packages/common-lib`

프레임워크에 의존하지 않는 순수 TypeScript 코드로 구현합니다.

### 3.1 역할 및 리소스 정의 (`src/auth/types.ts`)

```typescript
export enum UserRole {
  GUEST = 'GUEST',   // 비로그인
  MENTEE = 'MENTEE', // 기본 회원
  MENTOR = 'MENTOR', // 검증된 멘토
  ADMIN = 'ADMIN'    // 관리자
}

export enum Resource {
  // Pages
  PAGE_ADMIN = 'PAGE_ADMIN',
  PAGE_MENTOR_DASHBOARD = 'PAGE_MENTOR_DASHBOARD',
  
  // Domain Resources
  MENTORING_SESSION = 'MENTORING_SESSION',
  MENTORING_POST = 'MENTORING_POST',
  REVIEW = 'REVIEW'
}

export enum Action {
  READ = 'READ',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  MANAGE = 'MANAGE' // All actions
}
```

### 3.2 권한 정책 정의 (`src/auth/policy.ts`)

```typescript
import { UserRole, Resource, Action } from './types';

type PermissionSet = Partial<Record<Resource, Action[]>>;

export const ROLE_PERMISSIONS: Record<UserRole, PermissionSet> = {
  [UserRole.GUEST]: {
    // 공개 리소스 읽기 가능
    [Resource.MENTORING_POST]: [Action.READ],
  },
  [UserRole.MENTEE]: {
    // 멘티 권한
    [Resource.MENTORING_SESSION]: [Action.READ, Action.CREATE],
    [Resource.REVIEW]: [Action.CREATE, Action.READ],
  },
  [UserRole.MENTOR]: {
    // 멘토 권한 (멘티 권한 포함 가능하도록 로직 구성)
    [Resource.PAGE_MENTOR_DASHBOARD]: [Action.READ],
    [Resource.MENTORING_POST]: [Action.MANAGE],
    [Resource.MENTORING_SESSION]: [Action.READ, Action.UPDATE],
  },
  [UserRole.ADMIN]: {
    // 모든 권한 (와일드카드 처리 로직 필요)
    [Resource.PAGE_ADMIN]: [Action.READ],
  }
};
```

### 3.3 검증 로직 (`src/auth/ability.ts`)

이 함수는 어디서든 재사용 가능합니다.

```typescript
export function can(role: UserRole, action: Action, resource: Resource): boolean {
  if (role === UserRole.ADMIN) return true; // 관리자는 프리패스

  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  const allowedActions = permissions[resource];
  if (!allowedActions) return false;

  return allowedActions.includes(action) || allowedActions.includes(Action.MANAGE);
}
```

---

## 4. 프론트엔드 적용 (`apps/web`)

### 4.1 NextAuth Session 확장

`session.user.role`에 `common-lib`의 `UserRole`을 매핑합니다.

### 4.2 Middleware (Route Guard)

URL 경로를 `Resource`와 매핑하여 검사합니다.

```typescript
// route-policy.map.ts
export const ROUTE_RESOURCE_MAP: Record<string, Resource> = {
  '/admin': Resource.PAGE_ADMIN,
  '/mentor': Resource.PAGE_MENTOR_DASHBOARD,
};

// middleware.ts
const resource = getResourceFromPath(req.nextUrl.pathname);
if (resource) {
  if (!can(session.role, Action.READ, resource)) {
    return NextResponse.redirect('/unauthorized');
  }
}
```

### 4.3 UI Component (`PermissionGate`)

```tsx
// components/PermissionGate.tsx
export const PermissionGate = ({ action, resource, children }) => {
  const { role } = useSession();
  if (can(role, action, resource)) return <>{children}</>;
  return null;
};

// Usage
<PermissionGate action={Action.CREATE} resource={Resource.MENTORING_POST}>
  <Button>포스트 작성</Button>
</PermissionGate>
```

---

## 5. 백엔드 적용 (`apps/api`)

### 5.1 NestJS Guard

Decorator를 통해 필요한 권한을 메타데이터로 설정하고, Guard에서 `common-lib`의 `can()` 함수를 호출합니다.

```typescript
// decorators/require-permission.ts
export const RequirePermission = (action: Action, resource: Resource) => 
  SetMetadata('permission', { action, resource });

// guards/permission.guard.ts
@Injectable()
export class PermissionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { action, resource } = this.reflector.get('permission', context.getHandler());
    const user = context.switchToHttp().getRequest().user;
    
    // common-lib의 순수 함수 재사용!
    return can(user.role, action, resource);
  }
}

// controller
@Post()
@RequirePermission(Action.CREATE, Resource.MENTORING_POST)
createPost() { ... }
```

---

## 6. 결론: YAGNI vs Scalability

이 설계는 초기 구현 비용이 아주 조금 더 들지만(단순 if문 대비), 다음과 같은 이점을 제공합니다:

1.  **비즈니스 로직 보호**: 프론트엔드 URL이 바뀌어도 권한 정책은 변하지 않습니다.
2.  **완전한 일관성**: 프론트에서 "보여주는 버튼"과 백엔드에서 "허용하는 API"의 기준이 100% 일치합니다. (`common-lib` 공유 덕분)
3.  **ABAC 확장성**: 나중에 `can()` 함수 내부 로직만 변경하면, `resource`의 소유자(Owner) 체크 등의 복잡한 로직을 추가할 때도 호출부(Controller, UI)를 수정할 필요가 없습니다.
4.  **보안**: 권한 로직이 중앙화되어 있어 감사(Audit)와 테스트가 쉽습니다.