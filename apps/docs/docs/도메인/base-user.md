---
sidebar_position: 1
---

# 기본 사용자 구조

## 개요

코드멘토 서비스의 사용자는 멘토와 멘티로 구분되며, 이들은 공통된 기본 속성을 공유합니다.

## 기본 사용자 인터페이스

모든 사용자 타입(멘토/멘티)이 공통적으로 구현하는 기본 인터페이스입니다:

```typescript
interface IBaseUser {
  id: string
  email: string
  bojId: string
  phone: string
  isEmailVerified: boolean
  isPhoneVerified: boolean
  status: AccountStatus
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}
```

## 계정 상태

사용자 계정은 다음과 같은 상태를 가질 수 있습니다:

```typescript
enum AccountStatus {
  ACTIVE = "ACTIVE", // 활성 계정
  INACTIVE = "INACTIVE", // 비활성 계정
}
```

### 주요 필드 설명

| 필드            | 설명                | 필수 여부 |
| --------------- | ------------------- | --------- |
| email           | 사용자 이메일 주소  | 필수      |
| bojId           | 백준 온라인 저지 ID | 필수      |
| phone           | 전화번호            | 필수      |
| isEmailVerified | 이메일 인증 여부    | 필수      |
| isPhoneVerified | 전화번호 인증 여부  | 필수      |

## 사용 예시

```typescript
// BaseUser를 상속받는 엔티티 예시
@Entity()
export abstract class BaseUser implements IBaseUser {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  email: string

  @Column({ unique: true })
  bojId: string

  @Column({ unique: true })
  phone: string

  @Column()
  isEmailVerified: boolean

  @Column()
  isPhoneVerified: boolean

  @Column({
    type: "enum",
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  status: AccountStatus

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column({ nullable: true })
  lastLoginAt?: Date
}
```

## 참고사항

- email, bojId, phone은 unique 제약조건이 있습니다.
- 모든 날짜 필드는 UTC 기준으로 저장됩니다.
- lastLoginAt은 로그인 시 자동으로 업데이트됩니다.
- 상태 변경은 별도의 권한 체크가 필요합니다.
