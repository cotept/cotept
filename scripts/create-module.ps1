# 코테피티 모듈 생성 스크립트 (PowerShell)
# 사용법: .\scripts\create-module.ps1 -ModuleName "baekjoon"

param(
    [Parameter(Mandatory=$true)]
    [string]$ModuleName
)

$BasePath = "apps\api\src\modules"
$ModuleClass = (Get-Culture).TextInfo.ToTitleCase($ModuleName) + "Module"
$EntityClass = (Get-Culture).TextInfo.ToTitleCase($ModuleName)

Write-Host "🚀 Creating module: $ModuleName" -ForegroundColor Green

# 디렉토리 구조 생성
$directories = @(
    "$BasePath\$ModuleName",
    "$BasePath\$ModuleName\domain\model\__tests__",
    "$BasePath\$ModuleName\domain\vo\__tests__",
    "$BasePath\$ModuleName\application\dtos",
    "$BasePath\$ModuleName\application\mappers\__tests__",
    "$BasePath\$ModuleName\application\ports\in",
    "$BasePath\$ModuleName\application\ports\out",
    "$BasePath\$ModuleName\application\services\facade\__tests__",
    "$BasePath\$ModuleName\application\services\usecases\__tests__",
    "$BasePath\$ModuleName\infrastructure\adapter\in\controllers\__tests__",
    "$BasePath\$ModuleName\infrastructure\adapter\in\mappers",
    "$BasePath\$ModuleName\infrastructure\adapter\out\persistence\entities",
    "$BasePath\$ModuleName\infrastructure\adapter\out\persistence\mappers",
    "$BasePath\$ModuleName\infrastructure\adapter\out\persistence\repositories\__tests__",
    "$BasePath\$ModuleName\infrastructure\adapter\out\services"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

Write-Host "✅ Directory structure created" -ForegroundColor Green

# 파일 생성 함수
function New-ModuleFile {
    param(
        [string]$Path,
        [string]$Content
    )
    
    $Content | Out-File -FilePath $Path -Encoding UTF8
    Write-Host "📄 Created: $Path" -ForegroundColor Cyan
}

# 모듈 파일 생성
$moduleContent = @"
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${EntityClass}Controller } from './infrastructure/adapter/in/controllers/${ModuleName}.controller';
import { ${EntityClass}Entity } from './infrastructure/adapter/out/persistence/entities/${ModuleName}.entity';
import { TypeOrm${EntityClass}Repository } from './infrastructure/adapter/out/persistence/repositories/typeorm-${ModuleName}.repository';
import { Create${EntityClass}UseCaseImpl } from './application/services/usecases/create-${ModuleName}.usecase.impl';

@Module({
  imports: [
    TypeOrmModule.forFeature([${EntityClass}Entity]),
  ],
  controllers: [${EntityClass}Controller],
  providers: [
    {
      provide: '${EntityClass}RepositoryPort',
      useClass: TypeOrm${EntityClass}Repository,
    },
    {
      provide: 'Create${EntityClass}UseCase',
      useClass: Create${EntityClass}UseCaseImpl,
    },
  ],
  exports: ['${EntityClass}RepositoryPort', 'Create${EntityClass}UseCase'],
})
export class $ModuleClass {}
"@

New-ModuleFile -Path "$BasePath\$ModuleName\$ModuleName.module.ts" -Content $moduleContent

# 도메인 엔티티
$domainEntityContent = @"
import { randomUUID } from 'crypto';

export class $EntityClass {
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

  static create(): $EntityClass {
    return new $EntityClass();
  }

  static restore(
    id: string,
    createdAt: Date,
    updatedAt: Date,
  ): $EntityClass {
    return new $EntityClass(id, createdAt, updatedAt);
  }

  getId(): string {
    return this._id;
  }

  getCreatedAt(): Date {
    return this._createdAt;
  }

  getUpdatedAt(): Date {
    return this._updatedAt;
  }
}
"@

New-ModuleFile -Path "$BasePath\$ModuleName\domain\model\$ModuleName.ts" -Content $domainEntityContent

Write-Host "🎉 Module '$ModuleName' created successfully!" -ForegroundColor Green
Write-Host "📍 Location: $BasePath\$ModuleName" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor White
Write-Host "1. ✏️  Implement domain entities and value objects" -ForegroundColor Gray
Write-Host "2. 📝 Define use cases and complete DTOs" -ForegroundColor Gray
Write-Host "3. 🔧 Implement infrastructure adapters" -ForegroundColor Gray
Write-Host "4. 🧪 Write tests for core business logic" -ForegroundColor Gray
Write-Host "5. 📦 Add ${ModuleClass} to app.module.ts imports" -ForegroundColor Gray
