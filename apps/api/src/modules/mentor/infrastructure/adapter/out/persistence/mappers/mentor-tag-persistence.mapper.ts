import { Injectable } from "@nestjs/common"

import { MentorTagEntity } from "../entities/mentor-tag.entity"

import MentorTag from "@/modules/mentor/domain/model/mentor-tag"
import { EntityMapper } from "@/shared/infrastructure/mappers/entity.mapper"

@Injectable()
export class MentorTagPersistenceMapper extends EntityMapper<MentorTag, MentorTagEntity> {
  toDomain(entity: MentorTagEntity): MentorTag {
    return new MentorTag({
      idx: entity.idx,
      name: entity.name,
      category: entity.category,
      displayOrder: entity.displayOrder,
      isActive: EntityMapper.numberToBoolean(entity.isActive),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    })
  }

  toEntity(domain: MentorTag): MentorTagEntity {
    const entity = new MentorTagEntity()

    if (domain.idx !== undefined) {
      entity.idx = domain.idx
    }

    entity.name = domain.name
    entity.category = domain.category
    entity.displayOrder = domain.displayOrder
    entity.isActive = EntityMapper.booleanToNumber(domain.isActive)
    entity.createdAt = domain.createdAt
    entity.updatedAt = domain.updatedAt

    return entity
  }
}
