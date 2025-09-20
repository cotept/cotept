import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"

import { Repository } from "typeorm"

import { MentorProfileEntity } from "../entities/mentor-profile.entity"
import { MentorProfilePersistenceMapper } from "../mappers/mentor-profile-persistence.mapper"

import { MentorProfileRepositoryPort } from "@/modules/mentor/application/ports/out/mentor-profile-repository.port"
import MentorProfile from "@/modules/mentor/domain/model/mentor-profile"

/**
 * TypeORM 기반 멘토 프로필 리포지토리 구현체
 * 헥사고날 아키텍처의 아웃바운드 어댑터
 */
@Injectable()
export class MentorProfileRepository implements MentorProfileRepositoryPort {
  constructor(
    @InjectRepository(MentorProfileEntity)
    private readonly mentorProfileRepository: Repository<MentorProfileEntity>,
    private readonly mapper: MentorProfilePersistenceMapper,
  ) {}

  /**
   * 사용자 ID로 멘토 프로필 조회
   * @param userId 사용자 ID (cotept_user_id)
   * @returns 멘토 프로필 도메인 모델 (없으면 null)
   */
  async findByUserId(userId: string): Promise<MentorProfile | null> {
    const entity = await this.mentorProfileRepository.findOne({
      where: { userId },
      relations: ["user", "mentorProfileTags", "mentorProfileTags.mentorTag"],
    })

    if (!entity) {
      return null
    }

    return this.mapper.toDomain(entity)
  }

  /**
   * IDX로 멘토 프로필 조회
   * @param idx 멘토 프로필 IDX
   * @returns 멘토 프로필 도메인 모델 (없으면 null)
   */
  async findByIdx(idx: number): Promise<MentorProfile | null> {
    const entity = await this.mentorProfileRepository.findOne({
      where: { idx },
      relations: ["user", "mentorProfileTags", "mentorProfileTags.mentorTag"],
    })

    if (!entity) {
      return null
    }

    return this.mapper.toDomain(entity)
  }

  /**
   * 멘토 프로필 저장
   * @param mentorProfile 멘토 프로필 도메인 모델
   * @returns 저장된 멘토 프로필 도메인 모델
   */
  async save(mentorProfile: MentorProfile): Promise<MentorProfile> {
    const entity = this.mapper.toEntity(mentorProfile)
    const savedEntity = await this.mentorProfileRepository.save(entity)

    // 저장 후 관계 데이터를 포함하여 다시 조회
    const fullEntity = await this.mentorProfileRepository.findOne({
      where: { idx: savedEntity.idx },
      relations: ["user", "mentorProfileTags", "mentorProfileTags.mentorTag"],
    })

    return this.mapper.toDomain(fullEntity!)
  }

  /**
   * 멘토 프로필 삭제
   * @param idx 멘토 프로필 IDX
   * @returns 삭제 성공 여부
   */
  async delete(idx: number): Promise<boolean> {
    const result = await this.mentorProfileRepository.delete(idx)
    return result.affected! > 0
  }

  /**
   * 멘토 프로필 물리적 삭제
   * @param idx 멘토 프로필 IDX
   * @returns 삭제 성공 여부
   */
  async hardDelete(idx: number): Promise<boolean> {
    const result = await this.mentorProfileRepository.delete(idx)
    return result.affected! > 0
  }
}
