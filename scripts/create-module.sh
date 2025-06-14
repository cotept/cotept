#!/bin/bash

# 코테피티 모듈 생성 스크립트
# 사용법: ./scripts/create-module.sh <module-name>
# 예시: ./scripts/create-module.sh baekjoon

MODULE_NAME=$1
BASE_PATH="apps/api/src/modules"

if [ -z "$MODULE_NAME" ]; then
    echo "❌ 모듈 이름을 입력해주세요"
    echo "사용법: ./scripts/create-module.sh <module-name>"
    echo "예시: ./scripts/create-module.sh baekjoon"
    exit 1
fi

echo "🚀 Creating module: $MODULE_NAME"

# 기본 구조 생성
mkdir -p "$BASE_PATH/$MODULE_NAME"
mkdir -p "$BASE_PATH/$MODULE_NAME/domain/model/__tests__"
mkdir -p "$BASE_PATH/$MODULE_NAME/domain/vo/__tests__"
mkdir -p "$BASE_PATH/$MODULE_NAME/application/dtos"
mkdir -p "$BASE_PATH/$MODULE_NAME/application/mappers/__tests__"
mkdir -p "$BASE_PATH/$MODULE_NAME/application/ports/in"
mkdir -p "$BASE_PATH/$MODULE_NAME/application/ports/out"
mkdir -p "$BASE_PATH/$MODULE_NAME/application/services/facade/__tests__"
mkdir -p "$BASE_PATH/$MODULE_NAME/application/services/usecases/__tests__"
mkdir -p "$BASE_PATH/$MODULE_NAME/infrastructure/adapter/in/controllers/__tests__"
mkdir -p "$BASE_PATH/$MODULE_NAME/infrastructure/adapter/in/mappers"
mkdir -p "$BASE_PATH/$MODULE_NAME/infrastructure/adapter/out/persistence/entities"
mkdir -p "$BASE_PATH/$MODULE_NAME/infrastructure/adapter/out/persistence/mappers"
mkdir -p "$BASE_PATH/$MODULE_NAME/infrastructure/adapter/out/persistence/repositories/__tests__"
mkdir -p "$BASE_PATH/$MODULE_NAME/infrastructure/adapter/out/services"

echo "✅ Directory structure created"

# 파일 생성 함수
create_file() {
    local file_path=$1
    local content=$2
    echo "$content" > "$file_path"
    echo "📄 Created: $file_path"
}

# 모듈 파일 생성
MODULE_CLASS="$(echo $MODULE_NAME | sed 's/.*/\u&/')Module"
ENTITY_CLASS="$(echo $MODULE_NAME | sed 's/.*/\u&/')"

# 1. 모듈 파일
create_file "$BASE_PATH/$MODULE_NAME/$MODULE_NAME.module.ts" "import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${ENTITY_CLASS}Controller } from './infrastructure/adapter/in/controllers/${MODULE_NAME}.controller';
import { ${ENTITY_CLASS}Entity } from './infrastructure/adapter/out/persistence/entities/${MODULE_NAME}.entity';
import { TypeOrm${ENTITY_CLASS}Repository } from './infrastructure/adapter/out/persistence/repositories/typeorm-${MODULE_NAME}.repository';
import { Create${ENTITY_CLASS}UseCaseImpl } from './application/services/usecases/create-${MODULE_NAME}.usecase.impl';
import { Get${ENTITY_CLASS}UseCaseImpl } from './application/services/usecases/get-${MODULE_NAME}.usecase.impl';
import { Update${ENTITY_CLASS}UseCaseImpl } from './application/services/usecases/update-${MODULE_NAME}.usecase.impl';
import { Delete${ENTITY_CLASS}UseCaseImpl } from './application/services/usecases/delete-${MODULE_NAME}.usecase.impl';
import { ${ENTITY_CLASS}FacadeService } from './application/services/facade/${MODULE_NAME}-facade.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([${ENTITY_CLASS}Entity]),
  ],
  controllers: [${ENTITY_CLASS}Controller],
  providers: [
    // Repositories
    {
      provide: '${ENTITY_CLASS}RepositoryPort',
      useClass: TypeOrm${ENTITY_CLASS}Repository,
    },
    
    // Use Cases
    {
      provide: 'Create${ENTITY_CLASS}UseCase',
      useClass: Create${ENTITY_CLASS}UseCaseImpl,
    },
    {
      provide: 'Get${ENTITY_CLASS}UseCase',
      useClass: Get${ENTITY_CLASS}UseCaseImpl,
    },
    {
      provide: 'Update${ENTITY_CLASS}UseCase',
      useClass: Update${ENTITY_CLASS}UseCaseImpl,
    },
    {
      provide: 'Delete${ENTITY_CLASS}UseCase',
      useClass: Delete${ENTITY_CLASS}UseCaseImpl,
    },
    
    // Facade
    ${ENTITY_CLASS}FacadeService,
  ],
  exports: [
    '${ENTITY_CLASS}RepositoryPort',
    'Create${ENTITY_CLASS}UseCase',
    'Get${ENTITY_CLASS}UseCase',
    'Update${ENTITY_CLASS}UseCase',
    'Delete${ENTITY_CLASS}UseCase',
    ${ENTITY_CLASS}FacadeService,
  ],
})
export class $MODULE_CLASS {}"

# 2. Domain Layer
create_file "$BASE_PATH/$MODULE_NAME/domain/model/$MODULE_NAME.ts" "import { randomUUID } from 'crypto';

export class $ENTITY_CLASS {
  private readonly _id: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this._id = id || randomUUID();
    this._createdAt = createdAt || new Date();
    this._updatedAt = updatedAt || new Date();
  }

  // Factory method for creating new instance
  static create(/* parameters */): $ENTITY_CLASS {
    return new $ENTITY_CLASS();
  }

  // Factory method for restoring from persistence
  static restore(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    /* other parameters */
  ): $ENTITY_CLASS {
    return new $ENTITY_CLASS(id, createdAt, updatedAt);
  }

  // Getters
  getId(): string {
    return this._id;
  }

  getCreatedAt(): Date {
    return this._createdAt;
  }

  getUpdatedAt(): Date {
    return this._updatedAt;
  }

  // Business methods
  update(/* parameters */): void {
    this._updatedAt = new Date();
    // TODO: Add business logic
  }

  // Validation methods
  private validate(): void {
    // TODO: Add domain validation rules
  }
}"

# 3. Domain Tests
create_file "$BASE_PATH/$MODULE_NAME/domain/model/__tests__/$MODULE_NAME.entity.spec.ts" "import { $ENTITY_CLASS } from '../$MODULE_NAME';

describe('$ENTITY_CLASS', () => {
  describe('create', () => {
    it('should create a new ${MODULE_NAME} with valid data', () => {
      // Given
      // TODO: Add test data

      // When
      const ${MODULE_NAME} = $ENTITY_CLASS.create(/* parameters */);

      // Then
      expect(${MODULE_NAME}).toBeDefined();
      expect(${MODULE_NAME}.getId()).toBeDefined();
      expect(${MODULE_NAME}.getCreatedAt()).toBeInstanceOf(Date);
    });
  });

  describe('restore', () => {
    it('should restore ${MODULE_NAME} from persistence data', () => {
      // Given
      const id = 'test-id';
      const createdAt = new Date();
      const updatedAt = new Date();

      // When
      const ${MODULE_NAME} = $ENTITY_CLASS.restore(id, createdAt, updatedAt);

      // Then
      expect(${MODULE_NAME}.getId()).toBe(id);
      expect(${MODULE_NAME}.getCreatedAt()).toBe(createdAt);
      expect(${MODULE_NAME}.getUpdatedAt()).toBe(updatedAt);
    });
  });
});"

# 4. Application DTOs
create_file "$BASE_PATH/$MODULE_NAME/application/dtos/create-$MODULE_NAME.dto.ts" "export class Create${ENTITY_CLASS}Dto {
  // TODO: Add properties with validation decorators
  // Example:
  // @IsString()
  // @IsNotEmpty()
  // readonly name: string;
}"

create_file "$BASE_PATH/$MODULE_NAME/application/dtos/update-$MODULE_NAME.dto.ts" "import { PartialType } from '@nestjs/mapped-types';
import { Create${ENTITY_CLASS}Dto } from './create-${MODULE_NAME}.dto';

export class Update${ENTITY_CLASS}Dto extends PartialType(Create${ENTITY_CLASS}Dto) {
  // Additional update-specific properties if needed
}"

create_file "$BASE_PATH/$MODULE_NAME/application/dtos/$MODULE_NAME.dto.ts" "export class ${ENTITY_CLASS}Dto {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  
  // TODO: Add other properties
}"

create_file "$BASE_PATH/$MODULE_NAME/application/dtos/delete-$MODULE_NAME.dto.ts" "export class Delete${ENTITY_CLASS}Dto {
  readonly id: string;
}"

create_file "$BASE_PATH/$MODULE_NAME/application/dtos/index.ts" "export * from './create-$MODULE_NAME.dto';
export * from './update-$MODULE_NAME.dto';
export * from './$MODULE_NAME.dto';
export * from './delete-$MODULE_NAME.dto';"

echo "🎉 Module '$MODULE_NAME' created successfully!"
echo "📍 Location: $BASE_PATH/$MODULE_NAME"
echo ""
echo "📋 Next steps:"
echo "1. ✏️  Implement domain entities and value objects"
echo "2. 📝 Define use cases and complete DTOs"
echo "3. 🔧 Implement infrastructure adapters"
echo "4. 🧪 Write tests for core business logic"
echo "5. 📦 Add ${MODULE_CLASS} to app.module.ts imports"
echo ""
echo "🔗 Quick commands:"
echo "   cd $BASE_PATH/$MODULE_NAME"
echo "   code . # Open in VSCode"
