import { PasswordServicePort } from "@/modules/user/application/ports/out/password-service.port"
import { CryptoService } from "@/shared/infrastructure/services/crypto/crypto.service"
import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

/**
 * 비밀번호 서비스 구현체
 * 공유 CryptoService를 사용하여 비밀번호 관련 기능을 구현합니다.
 */
@Injectable()
export class PasswordService implements PasswordServicePort {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 비밀번호 해싱
   * @param password 평문 비밀번호
   * @returns 해시된 비밀번호와 솔트
   */
  async hashPassword(password: string): Promise<{ hash: string; salt: string }> {
    return this.cryptoService.hashPassword(password)
  }

  /**
   * 비밀번호 검증
   * @param plainPassword 평문 비밀번호
   * @param hashedPassword 해시된 비밀번호
   * @param salt 솔트
   * @returns 비밀번호 일치 여부
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return this.cryptoService.verifyPassword(plainPassword, hashedPassword)
  }

  /**
   * 비밀번호 정책 검증 (추가 기능)
   * @param password 검증할 비밀번호
   * @returns 검증 결과 및 오류 메시지
   */
  validatePasswordPolicy(password: string): { isValid: boolean; message?: string } {
    if (!password || password.length < 8) {
      return { isValid: false, message: "비밀번호는 최소 8자 이상이어야 합니다." }
    }

    if (password.length > 32) {
      return { isValid: false, message: "비밀번호는 최대 32자까지 허용됩니다." }
    }

    // 대소문자, 숫자, 특수문자를 포함하는지 검증
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,32}$/
    if (!passwordRegex.test(password)) {
      return {
        isValid: false,
        message: "비밀번호는 최소 하나의 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.",
      }
    }

    // 연속된 문자/숫자가 있는지 검증
    const sequentialCharsRegex =
      /(012|123|234|345|456|567|678|789|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i
    if (sequentialCharsRegex.test(password)) {
      return {
        isValid: false,
        message: "비밀번호에 연속된 문자나 숫자(123, abc 등)를 사용할 수 없습니다.",
      }
    }

    return { isValid: true }
  }

  /**
   * 임시 비밀번호 생성 (추가 기능)
   * @returns 정책에 맞는 랜덤 임시 비밀번호
   */
  generateTemporaryPassword(): string {
    // 특수문자 목록
    const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?"

    // 임시 비밀번호 구성 요소
    const upperCaseChars = "ABCDEFGHJKLMNPQRSTUVWXYZ" // I,O 제외 (헷갈림 방지)
    const lowerCaseChars = "abcdefghijkmnpqrstuvwxyz" // l,o 제외 (헷갈림 방지)
    const numberChars = "23456789" // 0,1 제외 (헷갈림 방지)

    // 각 종류별로 최소 1개 이상 포함
    let password = ""
    password += upperCaseChars.charAt(Math.floor(Math.random() * upperCaseChars.length))
    password += lowerCaseChars.charAt(Math.floor(Math.random() * lowerCaseChars.length))
    password += numberChars.charAt(Math.floor(Math.random() * numberChars.length))
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length))

    // 나머지 글자 랜덤 추가 (총 10자리)
    const remainingLength = 6
    const allChars = upperCaseChars + lowerCaseChars + numberChars + specialChars

    for (let i = 0; i < remainingLength; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length))
    }

    // 순서 섞기
    return password
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("")
  }
}
