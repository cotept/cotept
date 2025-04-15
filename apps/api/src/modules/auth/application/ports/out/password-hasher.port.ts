/**
 * 비밀번호 해싱 및 검증 포트
 * 비밀번호의 해싱과 검증을 위한 인터페이스입니다.
 */
export abstract class PasswordHasherPort {
  /**
   * 평문 비밀번호 해싱
   * @param password 평문 비밀번호
   * @return {hash, salt} 해싱된 비밀번호와 해싱에 사용된 솔트 값
   */
  abstract hash(password: string): Promise<{ hash: string; salt: string }>
  
  /**
   * 비밀번호 검증
   * @param password 평문 비밀번호
   * @param hash 해시된 비밀번호
   * @returns 비밀번호 일치 여부
   */
  abstract verify(password: string, hash: string): Promise<boolean>
}
