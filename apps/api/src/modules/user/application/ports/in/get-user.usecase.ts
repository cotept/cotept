import { UserDto } from "@/modules/user/application/dto/user.dto"

/**
 * 사용자 조회 유스케이스 인터페이스
 * 이 포트는 외부에서 사용자 정보를 조회하는 기능을 정의합니다.
 */
export abstract class GetUserUseCase {
  /**
   * IDX로 사용자 조회
   * @param idx 사용자 IDX
   * @returns 사용자 정보 DTO
   */
  abstract getByIdx(idx: number): Promise<UserDto>

  /**
   * 이메일로 사용자 조회
   * @param email 사용자 이메일
   * @returns 사용자 정보 DTO
   */
  abstract getByEmail(email: string): Promise<UserDto>

  /**
   * 사용자 ID로 사용자 조회
   * @param userId 사용자 ID 이메일
   * @returns 사용자 정보 DTO
   */
  abstract getByUserId(userId: string): Promise<UserDto>

  /**
   * 모든 사용자 조회
   * @param options 페이지네이션 및 필터링 옵션
   * @returns 사용자 정보 DTO 배열
   */
  abstract getAll(options?: {
    page?: number
    limit?: number
    role?: string
    status?: string
  }): Promise<{ users: UserDto[]; total: number; page: number; limit: number }>
}
