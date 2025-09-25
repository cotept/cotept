import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"

import { Repository } from "typeorm"

import { OnboardingStateRepositoryPort } from "@/modules/onboarding/application/ports/out/onboarding-state.repository.port"
import OnboardingState from "@/modules/onboarding/domain/model/onboarding-state.model"
import { OnboardingStateEntity } from "@/modules/onboarding/infrastructure/adapter/out/persistence/entities/onboarding-state.entity"
import { OnboardingStateMapper } from "@/modules/onboarding/infrastructure/adapter/out/persistence/mappers/onboarding-state.mapper"

@Injectable()
export class TypeOrmOnboardingStateRepository implements OnboardingStateRepositoryPort {
  constructor(
    @InjectRepository(OnboardingStateEntity)
    private readonly repository: Repository<OnboardingStateEntity>,
    private readonly mapper: OnboardingStateMapper,
  ) {}

  async findByUserId(userId: string): Promise<OnboardingState | null> {
    const entity = await this.repository.findOneBy({ userId })
    return entity ? this.mapper.toDomain(entity) : null
  }

  async save(state: OnboardingState): Promise<OnboardingState> {
    const entity = this.mapper.toEntity(state)
    const savedEntity = await this.repository.save(entity)
    return this.mapper.toDomain(savedEntity)
  }
}
