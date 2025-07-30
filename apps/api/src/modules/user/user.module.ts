import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"

// 매퍼
import { UserMapper } from "./application/mappers/user.mapper"
import { UserResponseMapper } from "./application/mappers/user-response.mapper"
// 포트
import { ChangePasswordUseCase } from "./application/ports/in/change-password.usecase"
import { CreateUserUseCase } from "./application/ports/in/create-user.usecase"
import { DeleteUserUseCase } from "./application/ports/in/delete-user.usecase"
import { GetUserUseCase } from "./application/ports/in/get-user.usecase"
import { UpdateUserUseCase } from "./application/ports/in/update-user.usecase"
import { PasswordServicePort } from "./application/ports/out/password-service.port"
import { UserRepositoryPort } from "./application/ports/out/user-repository.port"
// 파사드 서비스
import { UserFacadeService } from "./application/services/facade/user-facade.service"
// 유스케이스
import {
  ChangePasswordUseCaseImpl,
  CreateUserUseCaseImpl,
  DeleteUserUseCaseImpl,
  GetUserUseCaseImpl,
  UpdateUserUseCaseImpl,
} from "./application/services/usecases"
// 어댑터
import { UserController } from "./infrastructure/adapter/in/controllers"
import { UserRequestMapper } from "./infrastructure/adapter/in/mappers"
// 엔티티 (Repository 주입을 위해 필요)
import { UserEntity } from "./infrastructure/adapter/out/persistence/entities"
import { UserPersistenceMapper } from "./infrastructure/adapter/out/persistence/mappers"
import { TypeOrmUserRepository } from "./infrastructure/adapter/out/persistence/repositories"
import { PasswordService } from "./infrastructure/adapter/out/services/password"

// 공유 모듈
import { InfrastructureModule } from "@/shared/infrastructure/infrastructure.module"
import { DatabaseModule } from "@/shared/infrastructure/persistence/database.module"

@Module({
  imports: [
    DatabaseModule.forFeature([UserEntity]), // Repository 주입을 위해 필요
    ConfigModule,
    InfrastructureModule,
  ],
  controllers: [UserController],
  providers: [
    // 매퍼
    UserMapper,
    UserPersistenceMapper,
    UserRequestMapper,
    UserResponseMapper,

    // 파사드 서비스
    UserFacadeService,

    // 어댑터 (아웃바운드 포트 구현체)
    {
      provide: UserRepositoryPort,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: PasswordServicePort,
      useClass: PasswordService,
    },

    // 유스케이스 (인바운드 포트 구현체)
    {
      provide: GetUserUseCase,
      useClass: GetUserUseCaseImpl,
    },
    {
      provide: CreateUserUseCase,
      useClass: CreateUserUseCaseImpl,
    },
    {
      provide: UpdateUserUseCase,
      useClass: UpdateUserUseCaseImpl,
    },
    {
      provide: DeleteUserUseCase,
      useClass: DeleteUserUseCaseImpl,
    },
    {
      provide: ChangePasswordUseCase,
      useClass: ChangePasswordUseCaseImpl,
    },
  ],
  exports: [UserRepositoryPort, UserMapper, PasswordServicePort, UserFacadeService],
})
export class UserModule {}
