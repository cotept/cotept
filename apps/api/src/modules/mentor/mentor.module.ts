import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

import { GetMentorTagsUseCaseImpl } from "./application/services/usecases/get-mentor-tags.usecase.impl"
import { HardDeleteMentorProfileUseCaseImpl } from "./application/services/usecases/hard-delete-mentor-profile.usecase.impl"
import { UpdateMentorProfileUseCaseImpl } from "./application/services/usecases/update-mentor-profile.usecase.impl"
import { MentorProfileController } from "./infrastructure/adapter/in/controllers/mentor-profile.controller"
import {
  MentorProfileEntity,
  MentorProfileTagEntity,
  MentorTagEntity,
} from "./infrastructure/adapter/out/persistence/entities"
import { MentorProfilePersistenceMapper } from "./infrastructure/adapter/out/persistence/mappers/mentor-profile-persistence.mapper"
import { MentorTagPersistenceMapper } from "./infrastructure/adapter/out/persistence/mappers/mentor-tag-persistence.mapper"
import { MentorProfileRepository } from "./infrastructure/adapter/out/persistence/repositories/typeorm-mentor-profile.repository"
import { MentorTagRepository } from "./infrastructure/adapter/out/persistence/repositories/typeorm-mentor-tag.repository"

import { MentorProfileMapper } from "@/modules/mentor/application/mappers/mentor-profile.mapper"
import { MentorTagMapper } from "@/modules/mentor/application/mappers/mentor-tag.mapper"
import { CreateMentorProfileUseCase } from "@/modules/mentor/application/ports/in/create-mentor-profile.usecase"
import { DeleteMentorProfileUseCase } from "@/modules/mentor/application/ports/in/delete-mentor-profile.usecase"
import { GetMentorProfileUseCase } from "@/modules/mentor/application/ports/in/get-mentor-profile.usecase"
import { GetMentorTagsUseCase } from "@/modules/mentor/application/ports/in/get-mentor-tags.usecase"
import { HardDeleteMentorProfileUseCase } from "@/modules/mentor/application/ports/in/hard-delete-mentor-profile.usecase"
import { UpdateMentorProfileUseCase } from "@/modules/mentor/application/ports/in/update-mentor-profile.usecase"
import { MentorProfileRepositoryPort } from "@/modules/mentor/application/ports/out/mentor-profile-repository.port"
import { MentorTagRepositoryPort } from "@/modules/mentor/application/ports/out/mentor-tag-repository.port"
import { MentorFacadeService } from "@/modules/mentor/application/services/facade/mentor-facade.service"
import { CreateMentorProfileUseCaseImpl } from "@/modules/mentor/application/services/usecases/create-mentor-profile.usecase.impl"
import { DeleteMentorProfileUseCaseImpl } from "@/modules/mentor/application/services/usecases/delete-mentor-profile.usecase.impl"
import { GetMentorProfileUseCaseImpl } from "@/modules/mentor/application/services/usecases/get-mentor-profile.usecase.impl"

@Module({
  imports: [TypeOrmModule.forFeature([MentorProfileEntity, MentorTagEntity, MentorProfileTagEntity])],
  controllers: [MentorProfileController],
  providers: [
    // Facade
    MentorFacadeService,

    // Repositories
    {
      provide: MentorProfileRepositoryPort,
      useClass: MentorProfileRepository,
    },
    {
      provide: MentorTagRepositoryPort,
      useClass: MentorTagRepository,
    },

    // Mappers
    MentorProfileMapper,
    MentorTagMapper,
    MentorProfilePersistenceMapper,
    MentorTagPersistenceMapper,

    // Use Cases
    {
      provide: GetMentorProfileUseCase,
      useClass: GetMentorProfileUseCaseImpl,
    },
    {
      provide: CreateMentorProfileUseCase,
      useClass: CreateMentorProfileUseCaseImpl,
    },
    {
      provide: UpdateMentorProfileUseCase,
      useClass: UpdateMentorProfileUseCaseImpl,
    },
    {
      provide: DeleteMentorProfileUseCase,
      useClass: DeleteMentorProfileUseCaseImpl,
    },
    {
      provide: HardDeleteMentorProfileUseCase,
      useClass: HardDeleteMentorProfileUseCaseImpl,
    },
    {
      provide: GetMentorTagsUseCase,
      useClass: GetMentorTagsUseCaseImpl,
    },
  ],
  exports: [GetMentorProfileUseCase, GetMentorTagsUseCase, MentorProfileMapper, MentorTagMapper],
})
export class MentorModule {}
