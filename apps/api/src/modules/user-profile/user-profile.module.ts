import { Module } from "@nestjs/common"

// 매퍼
import { UserProfileMapper } from "./application/mappers/user-profile.mapper"
// 포트
import { CreateUserProfileUseCase } from "./application/ports/in/create-user-profile.usecase"
import { DeleteUserProfileUseCase } from "./application/ports/in/delete-user-profile.usecase"
import { GetUserProfileUseCase } from "./application/ports/in/get-user-profile.usecase"
import { UpdateUserProfileUseCase } from "./application/ports/in/update-user-profile.usecase"
import { UserProfileRepositoryPort } from "./application/ports/out/user-profile-repository.port"
// 파사드 서비스
import { UserProfileFacadeService } from "./application/services/facade/user-profile-facade.service"
// 유스케이스
import {
  CreateUserProfileUseCaseImpl,
  DeleteUserProfileUseCaseImpl,
  GetUserProfileUseCaseImpl,
  UpdateUserProfileUseCaseImpl,
} from "./application/services/usecases"
// 엔티티 (Repository 주입을 위해 필요)
import { UserProfileEntity } from "./infrastructure/adapter/out/persistence/entities"
import { UserProfilePersistenceMapper } from "./infrastructure/adapter/out/persistence/mappers"
import { TypeOrmUserProfileRepository } from "./infrastructure/adapter/out/persistence/repositories"

// User 모듈 의존성
import { UserModule } from "@/modules/user/user.module"
// 공유 모듈
import { DatabaseModule } from "@/shared/infrastructure/persistence/database.module"

@Module({
  imports: [
    DatabaseModule.forFeature([UserProfileEntity]), // Repository 주입을 위해 필요
    UserModule, // User 존재 여부 확인을 위한 의존성
  ],
  controllers: [],
  providers: [
    // 매퍼
    UserProfileMapper,
    UserProfilePersistenceMapper,

    // 파사드 서비스
    UserProfileFacadeService,

    // 어댑터 (아웃바운드 포트 구현체)
    {
      provide: UserProfileRepositoryPort,
      useClass: TypeOrmUserProfileRepository,
    },

    // 유스케이스 (인바운드 포트 구현체)
    {
      provide: CreateUserProfileUseCase,
      useClass: CreateUserProfileUseCaseImpl,
    },
    {
      provide: GetUserProfileUseCase,
      useClass: GetUserProfileUseCaseImpl,
    },
    {
      provide: UpdateUserProfileUseCase,
      useClass: UpdateUserProfileUseCaseImpl,
    },
    {
      provide: DeleteUserProfileUseCase,
      useClass: DeleteUserProfileUseCaseImpl,
    },
  ],
  exports: [
    UserProfileRepositoryPort,
    UserProfileMapper,
    UserProfileFacadeService,
    CreateUserProfileUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    DeleteUserProfileUseCase,
  ],
})
export class UserProfileModule {}
