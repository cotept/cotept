import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { EntityManager, Repository } from "typeorm"

import { UserEntity } from "@/modules/user/infrastructure/adapter/out/persistence/entities/user.entity"
import { BaseRepository } from "./base/base.repository"

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly manager: EntityManager,
  ) {
    super(userRepository, manager, "User")
  }

  // 사용자 관련 특화 메서드들
  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.executeOperation(async () => {
      const user = await this.entityRepository.findOne({
        where: { email } as any,
      })
      return user || null
    })
  }

  async findByBackjoonId(backjoonId: string): Promise<UserEntity | null> {
    return this.executeOperation(async () => {
      const user = await this.entityRepository.findOne({
        where: { backjoonId } as any,
      })
      return user || null
    })
  }

  // 멘토 관련 특화 메서드
  async findAllMentors(options?: { isActive?: boolean }): Promise<UserEntity[]> {
    return this.executeOperation(async () => {
      const queryBuilder = this.entityRepository
        .createQueryBuilder("user")
        .where("user.isMentor = :isMentor", { isMentor: true })

      if (options?.isActive !== undefined) {
        queryBuilder.andWhere("user.isActive = :isActive", { isActive: options.isActive })
      }

      return queryBuilder.getMany()
    })
  }

  // 멘토 승인 메서드
  async approveMentor(userId: string): Promise<UserEntity> {
    return this.executeOperation(async () => {
      const result = await this.entityRepository.update(
        { id: userId } as any,
        { isMentor: true, mentorApprovalDate: new Date() } as any,
      )

      if (!result.affected) {
        throw new Error(`User with ID ${userId} not found`)
      }

      return this.findOne({ id: userId } as any)
    })
  }
}
