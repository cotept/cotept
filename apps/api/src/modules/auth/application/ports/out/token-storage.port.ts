import { PendingLinkInfo } from "@/modules/auth/domain/model/pending-link-info"

/**
 * 토큰 저장소 포트
 * 토큰 저장, 블랙리스트 관리 및 토큰 패밀리 관리를 위한 인터페이스입니다.
 */
export abstract class TokenStoragePort {
  /**
   * 토큰 블랙리스트에 추가
   * @param tokenId 토큰 ID
   * @param expiresIn 만료 시간(초)
   */
  abstract addToBlacklist(tokenId: string, expiresIn: number): Promise<void>

  /**
   * 토큰이 블랙리스트에 있는지 확인
   * @param tokenId 토큰 ID
   * @returns 블랙리스트 포함 여부
   */
  abstract isBlacklisted(tokenId: string): Promise<boolean>

  /**
   * 리프레시 토큰 패밀리 저장
   * @param userId 사용자 ID
   * @param familyId 패밀리 ID
   * @param tokenId 토큰 ID
   * @param expiresIn 만료 시간(초)
   */
  abstract saveRefreshTokenFamily(userId: number, familyId: string, tokenId: string, expiresIn: number): Promise<void>

  /**
   * 리프레시 토큰 패밀리 확인
   * @param userId 사용자 ID
   * @param familyId 패밀리 ID
   * @returns 유효한 패밀리인 경우 토큰 ID, 아니면 null
   */
  abstract getRefreshTokenFamily(userId: number, familyId: string): Promise<string | null | undefined>

  /**
   * 리프레시 토큰 패밀리 삭제
   * @param userId 사용자 ID
   * @param familyId 패밀리 ID
   */
  abstract deleteRefreshTokenFamily(userId: number, familyId: string): Promise<void>

  /**
   * 사용자의 모든 리프레시 토큰 패밀리 삭제
   * @param userId 사용자 ID
   */
  abstract deleteAllRefreshTokenFamilies(userId: number): Promise<void>

  /**
   * 인증 코드 저장
   * @param code 인증 코드
   * @param userId 사용자 ID
   * @param expiresIn 만료 시간(초)
   */
  abstract saveAuthCode(code: string, userId: number, expiresIn: number): Promise<void>

  /**
   * 인증 코드로 사용자 ID 찾기
   * @param code 인증 코드
   * @returns 사용자 ID 또는 null
   */
  abstract getUserIdByAuthCode(code: string): Promise<number | undefined>

  /**
   * 인증 코드 삭제
   * @param code 인증 코드
   */
  abstract deleteAuthCode(code: string): Promise<void>

  /**
   * 소셜 계정 연결 대기 정보 저장
   * @param token 임시 토큰
   * @param pendingInfo 대기 중인 소셜 연결 정보
   * @param expiresIn 만료 시간(초)
   */
  abstract savePendingLinkInfo(token: string, pendingInfo: PendingLinkInfo, expiresIn: number): Promise<void>

  /**
   * 소셜 계정 연결 대기 정보 조회
   * @param token 임시 토큰
   * @returns 대기 중인 연결 정보 또는 null
   */
  abstract getPendingLinkInfo(token: string): Promise<PendingLinkInfo | null>

  /**
   * 소셜 계정 연결 대기 정보 삭제
   * @param token 임시 토큰
   */
  abstract deletePendingLinkInfo(token: string): Promise<void>
}
