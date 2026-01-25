import { Injectable } from "@nestjs/common"

import * as bcrypt from "bcrypt"
import * as crypto from "crypto"

/**
 * 암호화 관련 유틸리티 서비스
 * 애플리케이션 전체에서 사용되는 암호화 기능을 제공합니다.
 */
@Injectable()
export class CryptoService {
  // bcrypt 설정
  private readonly SALT_ROUNDS = 10

  /**
   * 비밀번호 해싱
   * @param password 평문 비밀번호
   * @returns 해시된 비밀번호와 솔트
   */
  async hashPassword(password: string): Promise<{ hash: string; salt: string }> {
    const salt = await bcrypt.genSalt(this.SALT_ROUNDS)
    const hash = await bcrypt.hash(password, salt)
    return { hash, salt }
  }

  /**
   * 비밀번호 검증
   * @param plainPassword 평문 비밀번호
   * @param hashedPassword 해시된 비밀번호
   * @param salt 솔트
   * @returns 비밀번호 일치 여부
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    // 동일한 솔트로 해싱하여 비교
    return await bcrypt.compare(plainPassword, hashedPassword)
  }

  /**
   * 고정 길이의 랜덤 문자열 생성
   * @param length 생성할 문자열 길이
   * @returns 랜덤 문자열
   */
  generateRandomString(length: number): string {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString("hex")
      .slice(0, length)
  }

  /**
   * 숫자로만 이루어진 랜덤 코드 생성 (인증 코드 등에 사용)
   * @param length 생성할 코드 길이
   * @returns 숫자로만 이루어진 랜덤 코드
   */
  generateRandomCode(length: number): string {
    let code = ""
    for (let i = 0; i < length; i++) {
      code += Math.floor(Math.random() * 10).toString()
    }
    return code
  }

  /**
   * 데이터 해싱 (SHA-256)
   * @param data 해싱할 데이터
   * @returns 해시값 (16진수 문자열)
   */
  hash(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex")
  }

  /**
   * HMAC 생성 (토큰 서명 등에 사용)
   * @param data 서명할 데이터
   * @param secret 비밀 키
   * @returns HMAC 서명
   */
  createHmac(data: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(data).digest("hex")
  }

  /**
   * 대칭 암호화 (AES-256-CBC)
   * @param text 암호화할 텍스트
   * @param encryptionKey 암호화 키
   * @returns 암호화된 텍스트 (Base64 인코딩)
   */
  encrypt(text: string, encryptionKey: string): string {
    const iv = crypto.randomBytes(16)
    const key = crypto.scryptSync(encryptionKey, "salt", 32)
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv)

    let encrypted = cipher.update(text, "utf8", "base64")
    encrypted += cipher.final("base64")

    // IV를 암호문과 함께 저장 (복호화에 필요)
    return iv.toString("hex") + ":" + encrypted
  }

  /**
   * 대칭 복호화 (AES-256-CBC)
   * @param encryptedText 암호화된 텍스트
   * @param encryptionKey 암호화 키
   * @returns 복호화된 원본 텍스트
   */
  decrypt(encryptedText: string, encryptionKey: string): string {
    const textParts = encryptedText.split(":")
    const iv = Buffer.from(textParts.shift()!, "hex")
    const encryptedData = textParts.join(":")
    const key = crypto.scryptSync(encryptionKey, "salt", 32)
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv)

    let decrypted = decipher.update(encryptedData, "base64", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  }

  /**
   * UUID 생성 (v4)
   * @returns UUID 문자열
   */
  generateUuid(): string {
    return crypto.randomUUID()
  }
}
