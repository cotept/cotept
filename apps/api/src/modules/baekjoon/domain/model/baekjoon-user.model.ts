import { BadRequestException } from "@nestjs/common"
import { BaekjoonHandle, Tier, TierLevel } from "../vo"

/**
 * 백준 사용자 도메인 엔티티
 * solved.ac 사용자 정보를 나타내는 도메인 객체
 */
export class BaekjoonUser {
  // 식별자 및 기본 정보
  private readonly userId: string
  private readonly handle: BaekjoonHandle

  // 티어 및 레이팅 정보
  private currentTier: Tier

  // 문제 풀이 통계
  private solvedCount: number
  private name?: string

  // 인증 관련 정보
  private verified?: boolean = false
  private verifiedAt?: Date
  private lastSyncedAt: Date

  // 시간 관련 정보
  private readonly createdAt: Date
  private updatedAt: Date

  constructor(params: {
    userId: string
    handle: BaekjoonHandle | string
    currentTier: Tier | TierLevel
    solvedCount: number
    name?: string
    verified?: boolean
    verifiedAt?: Date
    lastSyncedAt?: Date
    createdAt?: Date
    updatedAt?: Date
  }) {
    this.userId = params.userId

    // 핸들 설정 (값 객체 또는 문자열)
    this.handle = params.handle instanceof BaekjoonHandle ? params.handle : BaekjoonHandle.of(params.handle)

    // 현재 티어 설정
    this.currentTier = params.currentTier instanceof Tier ? params.currentTier : Tier.ofLevel(params.currentTier)

    this.solvedCount = params.solvedCount
    this.name = params.name
    this.verified = params.verified
    this.verifiedAt = params.verifiedAt
    this.lastSyncedAt = params.lastSyncedAt || new Date()
    this.createdAt = params.createdAt || new Date()
    this.updatedAt = params.updatedAt || new Date()
  }

  /**
   * solved.ac API 응답으로부터 백준 사용자 생성
   */
  public static fromSolvedAcApi(params: {
    userId: string
    handle: string
    tier: number
    solvedCount: number
    name?: string
  }): BaekjoonUser {
    const handle = BaekjoonHandle.of(params.handle)
    const currentTier = Tier.fromApiResponse(params.tier)

    return new BaekjoonUser({
      userId: params.userId,
      handle,
      currentTier,
      solvedCount: params.solvedCount,
      name: params.name,
      lastSyncedAt: new Date(),
    })
  }

  public static validateUserIdAndHandle(params: { userId: string; handle: string }) {
    if (!params.userId || params.userId.trim().length === 0) {
      throw new BadRequestException("사용자 ID가 필요합니다.")
    }

    if (!params.handle || params.handle.trim().length === 0) {
      throw new BadRequestException("백준 ID가 필요합니다.")
    }
  }

  // Getter 메서드들
  public getUserId(): string {
    return this.userId
  }

  public getHandle(): BaekjoonHandle {
    return this.handle
  }

  public getHandleString(): string {
    return this.handle.toString()
  }

  public getCurrentTier(): Tier {
    return this.currentTier
  }

  public getSolvedCount(): number {
    return this.solvedCount
  }

  public getName(): string | undefined {
    return this.name
  }

  public getVerified(): boolean | undefined {
    return this.verified
  }

  public getVerifiedAt(): Date | undefined {
    return this.verifiedAt
  }

  public getLastSyncedAt(): Date {
    return this.lastSyncedAt
  }

  public getCreatedAt(): Date {
    return this.createdAt
  }

  public getUpdatedAt(): Date {
    return this.updatedAt
  }

  /**
   * 인증 완료 처리
   */
  public markAsVerified(): BaekjoonUser {
    this.verified = true
    this.verifiedAt = new Date()
    this.updatedAt = new Date()
    return this
  }

  /**
   * solved.ac 데이터로 프로필 업데이트
   */
  public updateProfile(params: { tier: number; solvedCount: number; name?: string; verified?: boolean }): BaekjoonUser {
    this.currentTier = Tier.fromApiResponse(params.tier)
    this.solvedCount = params.solvedCount
    this.name = params.name
    this.verified = params.verified
    this.lastSyncedAt = new Date()
    this.updatedAt = new Date()

    return this
  }

  /**
   * 멘토 자격 확인
   */
  public isMentorEligible(): boolean {
    return this.currentTier.isMentorEligible()
  }

  /**
   * 인증 완료 여부 확인
   */
  public isVerified(): boolean {
    return this.verifiedAt !== undefined && this.verified !== undefined
  }

  /**
   * 데이터 동기화가 필요한지 확인 (45분 경과)
   */
  public possibleSync(): boolean {
    const syncInterval = 45 * 60 * 1000 // 45분
    const now = new Date()
    return now.getTime() - this.lastSyncedAt.getTime() > syncInterval
  }

  /**
   * 특정 name 문자열이 현재 name와 일치하는지 확인 (인증용)
   */
  public hasname(expectedname: string): boolean {
    return this.name === expectedname
  }

  /**
   * 동등성 비교 (userId와 handle 기준)
   */
  public equals(other: BaekjoonUser): boolean {
    return this.userId === other.userId && this.handle.equals(other.handle)
  }
}
