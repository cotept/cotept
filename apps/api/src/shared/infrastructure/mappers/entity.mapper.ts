import { BaseMapper } from "./base.mapper"

/**
 * Entity ↔ Domain 변환을 위한 추상 매퍼 클래스
 * 영속성 계층에서 사용
 */
export abstract class EntityMapper<Domain, Entity> extends BaseMapper {
  /**
   * Entity → Domain 변환
   */
  abstract toDomain(entity: Entity): Domain

  /**
   * Domain → Entity 변환
   */
  abstract toEntity(domain: Domain): Entity

  /**
   * Entity 배열 → Domain 배열 변환
   */
  toDomainList(entities: Entity[]): Domain[] {
    return BaseMapper.transformArray(entities, (entity: Entity) => this.toDomain(entity))
  }

  /**
   * Domain 배열 → Entity 배열 변환
   */
  toEntityList(domains: Domain[]): Entity[] {
    return BaseMapper.transformArray(domains, (domain: Domain) => this.toEntity(domain))
  }

  /**
   * Entity → Domain 안전 변환 (null/undefined 허용)
   */
  toDomainSafe(entity: Entity | null | undefined): Domain | undefined {
    return BaseMapper.safeTransform(entity, (e: Entity) => this.toDomain(e))
  }

  /**
   * Domain → Entity 안전 변환 (null/undefined 허용)
   */
  toEntitySafe(domain: Domain | null | undefined): Entity | undefined {
    return BaseMapper.safeTransform(domain, (d: Domain) => this.toEntity(d))
  }
}