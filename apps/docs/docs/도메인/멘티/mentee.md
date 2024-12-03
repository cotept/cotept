---
sidebar_position: 1
---

# 멘티 Mentee

## 개요

멘티는 코딩테스트 멘토링을 받는 사용자로, 기본 사용자(BaseUser) 속성을 상속받습니다.

## 멘티 인터페이스

```typescript
interface IMentee extends IBaseUser {
  currentTier?: string // optional
}
```

## 사용 예시

```typescript
@Entity("mentees")
export class Mentee extends BaseUser implements IMentee {
  @Column({ nullable: true })
  currentTier?: string
}
```
