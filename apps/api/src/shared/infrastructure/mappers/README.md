# 도메인 매퍼 (Domain Mappers)

코테피티 프로젝트는 DDD(Domain-Driven Design) 원칙을 따르며, 도메인 객체와 인프라스트럭처 객체(엔티티) 사이의 변환을 담당하는 매퍼 계층을 구현합니다. 이 프로젝트에서는 `class-transformer` 라이브러리를 사용하여 객체 변환을 처리합니다.

## 목적

매퍼 계층의 주요 목적은 다음과 같습니다:

1. **도메인 모델의 순수성 유지**: 도메인 모델이 ORM이나 데이터베이스 관련 코드에 오염되지 않도록 보호
2. **계층 간 관심사 분리**: 도메인 로직과 영속성 계층 사이의 명확한 경계 유지
3. **타입 변환 자동화**: ID와 같은 필드의 타입 변환(숫자 <-> 문자열) 자동화
4. **일관된 변환 규칙 적용**: 어플리케이션 전체에서 일관된 객체 변환 보장

## 아키텍처

매퍼 시스템은 다음과 같은 주요 컴포넌트로 구성됩니다:

1. **매퍼 클래스**: 각 도메인별로 구현되며, 해당 도메인 객체와 엔티티 간의 변환을 담당
2. **class-transformer**: 객체 변환을 위한 핵심 라이브러리
3. **데코레이터**: 필요한 경우 class-transformer 데코레이터를 사용하여 변환 규칙 정의

## 구현 예시: User 도메인

### 1. User 도메인 클래스 (순수 도메인 모델)

```typescript
// apps/api/src/modules/user/domain/user.ts
export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public phoneNumber: string,
    public passwordHash: string,
    public role: UserRole,
    public status: UserStatus,
    public loginFailCount: number,
    public lastLoginAt?: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt?: Date,
  ) {}
}
```

### 2. User 엔티티 (ORM 엔티티)

```typescript
// apps/api/src/modules/user/infrastructure/persistence/entities/user.entity.ts
@Entity({ schema: "auth", name: "users" })
export class UserEntity extends BaseEntity<UserEntity> {
  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 20, unique: true, name: "phone_number" })
  phoneNumber: string;

  // 기타 필드...
}
```

### 3. User 매퍼 (변환 로직)

```typescript
// apps/api/src/modules/user/infrastructure/persistence/mappers/user.mapper.ts
@Injectable()
export class UserMapper {
  toDomain(entity: UserEntity): User {
    const plainEntity = instanceToPlain(entity);
    plainEntity.id = String(plainEntity.id);
    
    // null/undefined 처리
    if (plainEntity.lastLoginAt === null) {
      plainEntity.lastLoginAt = undefined;
    }
    
    return plainToInstance(User, plainEntity);
  }

  toEntity(domain: User): UserEntity {
    const plainDomain = instanceToPlain(domain);
    plainDomain.id = Number(plainDomain.id);
    
    return plainToInstance(UserEntity, plainDomain);
  }
  
  // 기타 유틸리티 메서드...
}
```

## 리포지토리에서 사용 예시

```typescript
@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    entityRepository: Repository<UserEntity>,
    entityManager: EntityManager,
    private readonly userMapper: UserMapper
  ) {
    super(entityRepository, entityManager, 'User');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.executeOperation(async () => {
      const entity = await this.entityRepository.findOne({
        where: { email } as any,
      });
      
      if (!entity) return null;
      
      // 엔티티를 도메인 객체로 변환
      return this.userMapper.toDomain(entity);
    });
  }

  async createUser(user: User): Promise<User> {
    return this.executeOperation(async () => {
      // 도메인 객체를 엔티티로 변환
      const entity = this.userMapper.toEntity(user);
      
      // 저장
      const savedEntity = await this.entityRepository.save(entity);
      
      // 결과를 도메인 객체로 변환하여 반환
      return this.userMapper.toDomain(savedEntity);
    });
  }
}
```

## class-transformer 장점

1. **간편한 사용법**: 직관적인 API (`plainToInstance`, `instanceToPlain`)
2. **데코레이터 지원**: `@Expose()`, `@Exclude()`, `@Type()` 등 유용한 데코레이터 제공
3. **NestJS 통합**: NestJS와 완벽하게 통합되어 있음
4. **대중성**: 가장 널리 사용되는 객체 변환 라이브러리
5. **최소한의 보일러플레이트**: 적은 양의 코드로 강력한 기능 제공

## 사용 설정

1. 패키지 설치:
```bash
npm install class-transformer reflect-metadata
```

2. `tsconfig.json`에 다음 설정 추가:
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

3. 엔트리 포인트(main.ts)에 추가:
```typescript
import 'reflect-metadata';
```

## 고급 사용법

### 1. 데코레이터 활용

```typescript
import { Expose, Exclude, Type } from 'class-transformer';

export class UserDTO {
  @Expose() // 명시적으로 포함
  id: string;
  
  @Exclude() // 변환에서 제외
  passwordHash: string;
  
  @Type(() => Date) // 타입 변환
  createdAt: Date;
}
```

### 2. 변환 옵션 설정

```typescript
plainToInstance(User, plainEntity, {
  excludeExtraneousValues: true, // @Expose가 있는 속성만 포함
  exposeUnsetFields: false, // 정의되지 않은 필드 무시
  enableImplicitConversion: true // 암시적 타입 변환 활성화
});
```

### 3. 중첩 객체 변환

```typescript
@Type(() => Address)
address: Address;
```

## 참고사항

- 프로젝트에서는 ID 타입을 일관되게 관리하는 것이 좋습니다. (도메인에서는 문자열, DB에서는 숫자)
- 매퍼를 사용하면 도메인 모델이 인프라스트럭처 관심사에서 완전히 분리되어, 도메인 로직의 테스트 용이성이 크게 향상됩니다.
- class-transformer는 매우 유연하지만, 복잡한 매핑 케이스에서는 직접 변환 로직을 구현하는 것이 더 명확할 수 있습니다.
