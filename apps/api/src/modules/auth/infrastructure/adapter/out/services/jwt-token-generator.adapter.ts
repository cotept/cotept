import { JwtConfig } from "@/configs/token"
import { TokenGeneratorPort } from "@/modules/auth/application/ports/out/token-generator.port"
import { RefreshTokenPayload, TokenPair, TokenPayload } from "@/modules/auth/domain/model"
import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { v4 as uuidv4 } from "uuid"

/**
 * JWT 토큰 생성기 구현 클래스
 */
@Injectable()
export class JwtTokenGeneratorAdapter implements TokenGeneratorPort {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 액세스 토큰과 리프레시 토큰 쌍 생성
   * @param userId 사용자 ID
   * @param email 사용자 이메일
   * @param role 사용자 역할
   * @returns 토큰 쌍
   */
  generateTokenPair(userId: string, email: string, role: string): TokenPair {
    // 액세스 토큰 설정
    const accessTokenExpiresIn = parseInt(
      this.configService.getOrThrow<JwtConfig>("jwt").accessExpiresIn || "1800", // 기본 30분
    )
    const accessTokenId = this.generateTokenId()
    const accessTokenPayload: Partial<TokenPayload> = {
      sub: userId,
      email,
      role,
      jti: accessTokenId,
      iat: Math.floor(Date.now() / 1000),
      // exp: Math.floor(Date.now() / 1000) + accessTokenExpiresIn,
      metadata: undefined,
    }

    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: this.configService.getOrThrow<JwtConfig>("jwt").jwtSecret,
      expiresIn: accessTokenExpiresIn,
    })

    // 리프레시 토큰 설정
    const refreshTokenExpiresIn = parseInt(
      this.configService.getOrThrow<JwtConfig>("jwt").refreshExpiresIn || "604800", // 기본 7일
    )
    const refreshTokenId = this.generateTokenId()
    const familyId = this.generateFamilyId()
    const refreshTokenPayload: Partial<RefreshTokenPayload> = {
      sub: userId,
      family: familyId,
      jti: refreshTokenId,
      iat: Math.floor(Date.now() / 1000),
      // exp: Math.floor(Date.now() / 1000) + refreshTokenExpiresIn,
    }

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: this.configService.getOrThrow<JwtConfig>("jwt").jwtRefreshSecret,
      expiresIn: refreshTokenExpiresIn,
    })

    // 토큰 쌍 생성
    return TokenPair.create(
      accessToken,
      refreshToken,
      accessTokenExpiresIn,
      refreshTokenExpiresIn,
      accessTokenId,
      refreshTokenId,
      familyId,
      "Bearer",
    )
  }

  /**
   * 액세스 토큰 검증 및 페이로드 추출
   * @param token 토큰 문자열
   * @returns 토큰 페이로드 또는 null
   */
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const payload = this.jwtService.verify<TokenPayload>(token)
      return payload
    } catch (error) {
      return null
    }
  }

  /**
   * 리프레시 토큰 검증 및 페이로드 추출
   * @param token 토큰 문자열
   * @returns 토큰 페이로드 또는 null
   */
  verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      const secret =
        this.configService.getOrThrow<JwtConfig>("jwt").jwtRefreshSecret ||
        this.configService.getOrThrow<JwtConfig>("jwt").jwtSecret
      const payload = this.jwtService.verify<RefreshTokenPayload>(token, { secret })
      return payload
    } catch (error) {
      return null
    }
  }

  /**
   * 새로운 패밀리 ID 생성
   * @returns 패밀리 ID
   */
  generateFamilyId(): string {
    return uuidv4()
  }

  /**
   * 토큰 ID 생성
   * @returns 토큰 ID
   */
  generateTokenId(): string {
    return uuidv4()
  }
}
