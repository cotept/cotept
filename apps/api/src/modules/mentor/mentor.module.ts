import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

import { MentorProfileMapper } from "./application/mappers/mentor-profile.mapper"
import { MentorTagMapper } from "./application/mappers/mentor-tag.mapper"
import { MentorFacadeService } from "./application/services/facade/mentor-facade.service"
import { CreateMentorProfileUseCaseImpl } from "./application/services/usecases/create-mentor-profile.usecase.impl"
import { DeleteMentorProfileUseCaseImpl } from "./application/services/usecases/delete-mentor-profile.usecase.impl"
import { GetMentorProfileUseCaseImpl } from "./application/services/usecases/get-mentor-profile.usecase.impl"
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

@Module({
  imports: [TypeOrmModule.forFeature([MentorProfileEntity, MentorTagEntity, MentorProfileTagEntity])],
  controllers: [MentorProfileController],
  providers: [
    // Facade
    MentorFacadeService,

    // Repositories
    {
      provide: "MentorProfileRepositoryPort",
      useClass: MentorProfileRepository,
    },
    {
      provide: "MentorTagRepositoryPort",
      useClass: MentorTagRepository,
    },

    // Mappers
    MentorProfileMapper,
    MentorTagMapper,
    MentorProfilePersistenceMapper,
    MentorTagPersistenceMapper,

    // Use Cases
    {
      provide: "GetMentorProfileUseCase",
      useClass: GetMentorProfileUseCaseImpl,
    },
    {
      provide: "CreateMentorProfileUseCase",
      useClass: CreateMentorProfileUseCaseImpl,
    },
    {
      provide: "UpdateMentorProfileUseCase",
      useClass: UpdateMentorProfileUseCaseImpl,
    },
    {
      provide: "DeleteMentorProfileUseCase",
      useClass: DeleteMentorProfileUseCaseImpl,
    },
    {
      provide: "HardDeleteMentorProfileUseCase",
      useClass: HardDeleteMentorProfileUseCaseImpl,
    },
  ],
  exports: ["GetMentorProfileUseCase", MentorProfileMapper, MentorTagMapper],
})
export class MentorModule {}
