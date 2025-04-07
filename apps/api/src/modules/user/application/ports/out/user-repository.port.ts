import User, { UserRole, UserStatus } from "@/modules/user/domain/model/user"

/**
 * 사용자 저장소 인터페이스 (아웃바운드 포트)
 * 이 포트는 애플리케이션이 도메인 레이어에서 영속성 레이어와 통신하는 방법을 정의합니다.
 */
export abstract class UserRepositoryPort {
  /**
   * ID로 사용자 조회
   * @param id 사용자 ID
   * @returns 사용자 도메인 엔티티 또는 null
   */
  abstract findById(id: string): Promise<User | null>

  /**
   * 이메일로 사용자 조회
   * @param email 사용자 이메일
   * @returns 사용자 도메인 엔티티 또는 null
   */
  abstract findByEmail(email: string): Promise<User | null>

  /**
   * 모든 사용자 조회 (페이지네이션 및 필터링 지원)
   * @param options 페이지네이션 및 필터링 옵션
   * @returns 사용자 도메인 엔티티 배열 및 총 개수
   */
  abstract findAll(options?: {
    page?: number
    limit?: number
    role?: UserRole
    status?: UserStatus
  }): Promise<{ users: User[]; total: number }>

  /**
   * 사용자 저장 (생성 또는 업데이트)
   * @param user 저장할 사용자 도메인 엔티티
   * @returns 저장된 사용자 도메인 엔티티
   */
  abstract save(user: User): Promise<User>

  /**
   * 사용자 삭제
   * @param id 삭제할 사용자 ID
   * @returns 삭제 성공 여부
   */
  abstract delete(id: string): Promise<boolean>

  /**
   * 중복 이메일 확인
   * @param email 확인할 이메일
   * @returns 중복 여부
   */
  abstract existsByEmail(email: string): Promise<boolean>
}
