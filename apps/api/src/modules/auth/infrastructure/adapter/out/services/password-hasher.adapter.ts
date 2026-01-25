import { Injectable } from "@nestjs/common"

import { PasswordHasherPort } from "@/modules/auth/application/ports/out/password-hasher.port"
import { CryptoService } from "@/shared/infrastructure/services/crypto/crypto.service"

/**
 * 공통 CryptoService를 이용한 비밀번호 해싱 어댑터
 */
@Injectable()
export class PasswordHasherAdapter implements PasswordHasherPort {
  constructor(private readonly cryptoService: CryptoService) {}

  /**
   * 비밀번호 해싱
   * @param password 평문 비밀번호
   * @returns 해시와 솔트
   */
  async hash(password: string): Promise<{ hash: string; salt: string }> {
    const { hash, salt } = await this.cryptoService.hashPassword(password)
    return { hash, salt }
  }

  /**
   * 비밀번호 검증
   * @param password 평문 비밀번호
   * @param hash 저장된 해시
   * @returns 비밀번호 일치 여부
   */
  async verify(password: string, hash: string): Promise<boolean> {
    return await this.cryptoService.verifyPassword(password, hash)
  }
}
