import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"

import { In, Repository } from "typeorm"

import { MentorTagEntity } from "../entities/mentor-tag.entity"
import { MentorTagPersistenceMapper } from "../mappers/mentor-tag-persistence.mapper"

import { MentorTagRepositoryPort } from "@/modules/mentor/application/ports/out/mentor-tag-repository.port"
import MentorTag from "@/modules/mentor/domain/model/mentor-tag"

@Injectable()
export class MentorTagRepository implements MentorTagRepositoryPort {
  constructor(
    @InjectRepository(MentorTagEntity)
    private readonly repository: Repository<MentorTagEntity>,
    private readonly mapper: MentorTagPersistenceMapper,
  ) {}

  async findByIds(tagIds: number[]): Promise<MentorTag[]> {
    const entities = await this.repository.findBy({ idx: In(tagIds) });

    return this.mapper.toDomainList(entities);
  }

  async findAll(): Promise<MentorTag[]> {
    const entities = await this.repository.find({
      order: {
        category: "ASC",
        displayOrder: "ASC",
      },
    });
    return this.mapper.toDomainList(entities);
  }
}
