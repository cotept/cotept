import { BaseMapper } from "./base.mapper"

/**
 * Domain ↔ DTO 변환을 위한 추상 매퍼 클래스
 * 애플리케이션 계층에서 사용
 */
export abstract class DtoMapper<Domain, Dto> extends BaseMapper {
  /**
   * Domain → DTO 변환
   */
  abstract toDto(domain: Domain): Dto

  /**
   * DTO → Domain 변환
   */
  abstract toDomain(dto: Dto): Domain

  /**
   * Domain 배열 → DTO 배열 변환
   */
  toDtoList(domains: Domain[]): Dto[] {
    return BaseMapper.transformArray(domains, (domain: Domain) => this.toDto(domain))
  }

  /**
   * DTO 배열 → Domain 배열 변환
   */
  toDomainList(dtos: Dto[]): Domain[] {
    return BaseMapper.transformArray(dtos, (dto: Dto) => this.toDomain(dto))
  }

  /**
   * Domain → DTO 안전 변환 (null/undefined 허용)
   */
  toDtoSafe(domain: Domain | null | undefined): Dto | undefined {
    return BaseMapper.safeTransform(domain, (d: Domain) => this.toDto(d))
  }

  /**
   * DTO → Domain 안전 변환 (null/undefined 허용)
   */
  toDomainSafe(dto: Dto | null | undefined): Domain | undefined {
    return BaseMapper.safeTransform(dto, (d: Dto) => this.toDomain(d))
  }
}