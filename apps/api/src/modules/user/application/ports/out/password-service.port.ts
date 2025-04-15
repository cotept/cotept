/**
 * 비밀번호 서비스 인터페이스 (아웃바운드 포트)
 * 이 포트는 애플리케이션이 비밀번호 해싱, 검증 등 보안 관련 기능을 사용하는 방법을 정의합니다.
 */
export abstract class PasswordServicePort {
  /**
   * 비밀번호 해싱
   * @param password 해싱할 평문 비밀번호
   * @returns 솔트와 해시된 비밀번호
   */
  abstract hashPassword(password: string): Promise<{ hash: string; salt: string }>

  /**
   * 비밀번호 검증
   * @param plainPassword 평문 비밀번호
   * @param hashedPassword 해시된 비밀번호
   * @param salt 솔트
   * @returns 비밀번호 일치 여부
   */
  abstract verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>
}
