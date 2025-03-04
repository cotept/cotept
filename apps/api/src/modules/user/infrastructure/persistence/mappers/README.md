# User 도메인 매퍼

이 폴더는 User 도메인 객체와 UserEntity 간의 변환을 담당하는 매퍼 관련 코드를 포함합니다.

## 파일 구조

- `user-mapping.profile.ts`: User 도메인과 UserEntity 간의 매핑 규칙을 정의합니다.
- `user.mapper.ts`: 레포지토리 계층에서 사용하는 실제 매퍼 클래스입니다.

## 주요 기능

1. **도메인 ↔ 엔티티 변환**:
   - `toDomain()`: UserEntity → User 도메인 변환
   - `toEntity()`: User 도메인 → UserEntity 변환

2. **ID 타입 자동 변환**:
   - 도메인: 문자열 ID (string)
   - 엔티티: 숫자 ID (number)

3. **Null 및 undefined 처리**:
   - lastLoginAt, deletedAt 등의 null/undefined 처리

4. **부분 업데이트 지원**:
   - `updateEntity()` 메서드를 통한 부분 업데이트 지원

## 사용 예시

```typescript
// 엔티티 → 도메인 변환
const user: User = userMapper.toDomain(userEntity);

// 도메인 → 엔티티 변환
const userEntity: UserEntity = userMapper.toEntity(user);

// 부분 업데이트
const updatedEntity = userMapper.updateEntity(
  { status: UserStatus.SUSPENDED }, 
  existingEntity
);
```

## 매핑 설정 방법

새로운 필드를 추가하거나 매핑 규칙을 변경하려면 `user-mapping.profile.ts` 파일을 수정하세요.

```typescript
// user-mapping.profile.ts에 새 필드 매핑 추가 예시
forMember(
  dest => dest.newField,
  mapFrom(src => src.newField)
),
```

## 참고 사항

- User 도메인과 관련된 복잡한 비즈니스 로직은 도메인 객체에 구현하고, 매퍼는 단순 변환만 담당하게 유지하는 것이 좋습니다.
- 매핑 로직이 변경되면 관련 테스트도 업데이트해야 합니다.
