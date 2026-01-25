import UserProfile from "@/modules/user-profile/domain/model/user-profile"

/**
 * 사용자 프로필 저장소 인터페이스 (아웃바운드 포트)
 * 이 포트는 애플리케이션이 도메인 레이어에서 영속성 레이어와 통신하는 방법을 정의합니다.
 */
export abstract class UserProfileRepositoryPort {
  /**
   * IDX로 프로필 조회
   * @param idx 프로필 IDX (기본키)
   * @returns 프로필 도메인 엔티티 또는 null
   */
  abstract findByIdx(idx: number): Promise<UserProfile | null>

  /**
   * 사용자 ID로 프로필 조회
   * @param userId 사용자 ID
   * @returns 프로필 도메인 엔티티 또는 null
   */
  abstract findByUserId(userId: string): Promise<UserProfile | null>

  /**
   * 닉네임으로 프로필 조회 (중복 확인용)
   * @param nickname 닉네임
   * @returns 프로필 도메인 엔티티 또는 null
   */
  abstract findByNickname(nickname: string): Promise<UserProfile | null>

  /**
   * 프로필 저장 (생성 또는 업데이트)
   * @param profile 저장할 프로필 도메인 엔티티
   * @returns 저장된 프로필 도메인 엔티티
   */
  abstract save(profile: UserProfile): Promise<UserProfile>

  /**
   * 프로필 삭제
   * @param userId 삭제할 사용자 ID
   * @returns 삭제 성공 여부
   */
  abstract delete(userId: string): Promise<boolean>

  /**
   * 사용자 ID로 프로필 존재 여부 확인
   * @param userId 확인할 사용자 ID
   * @returns 존재 여부
   */
  abstract existsByUserId(userId: string): Promise<boolean>

  /**
   * 닉네임 중복 확인
   * @param nickname 확인할 닉네임
   * @param excludeUserId 제외할 사용자 ID (업데이트 시)
   * @returns 중복 여부
   */
  abstract existsByNickname(nickname: string, excludeUserId?: string): Promise<boolean>
}
