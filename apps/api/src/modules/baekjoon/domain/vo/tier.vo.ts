/**
 * solved.ac 티어 값 객체
 * 백준 사용자의 solved.ac 티어 정보를 관리
 */
export enum TierLevel {
  UNRATED = 0,
  BRONZE_V = 1,
  BRONZE_IV = 2,
  BRONZE_III = 3,
  BRONZE_II = 4,
  BRONZE_I = 5,
  SILVER_V = 6,
  SILVER_IV = 7,
  SILVER_III = 8,
  SILVER_II = 9,
  SILVER_I = 10,
  GOLD_V = 11,
  GOLD_IV = 12,
  GOLD_III = 13,
  GOLD_II = 14,
  GOLD_I = 15,
  PLATINUM_V = 16,
  PLATINUM_IV = 17,
  PLATINUM_III = 18,
  PLATINUM_II = 19,
  PLATINUM_I = 20,
  DIAMOND_V = 21,
  DIAMOND_IV = 22,
  DIAMOND_III = 23,
  DIAMOND_II = 24,
  DIAMOND_I = 25,
  RUBY_V = 26,
  RUBY_IV = 27,
  RUBY_III = 28,
  RUBY_II = 29,
  RUBY_I = 30,
  MASTER = 31,
}

export class Tier {
  private readonly level: TierLevel

  // 티어별 이름 매핑
  private static readonly TIER_NAMES: Record<TierLevel, string> = {
    [TierLevel.UNRATED]: "Unrated",
    [TierLevel.BRONZE_V]: "Bronze V",
    [TierLevel.BRONZE_IV]: "Bronze IV",
    [TierLevel.BRONZE_III]: "Bronze III",
    [TierLevel.BRONZE_II]: "Bronze II",
    [TierLevel.BRONZE_I]: "Bronze I",
    [TierLevel.SILVER_V]: "Silver V",
    [TierLevel.SILVER_IV]: "Silver IV",
    [TierLevel.SILVER_III]: "Silver III",
    [TierLevel.SILVER_II]: "Silver II",
    [TierLevel.SILVER_I]: "Silver I",
    [TierLevel.GOLD_V]: "Gold V",
    [TierLevel.GOLD_IV]: "Gold IV",
    [TierLevel.GOLD_III]: "Gold III",
    [TierLevel.GOLD_II]: "Gold II",
    [TierLevel.GOLD_I]: "Gold I",
    [TierLevel.PLATINUM_V]: "Platinum V",
    [TierLevel.PLATINUM_IV]: "Platinum IV",
    [TierLevel.PLATINUM_III]: "Platinum III",
    [TierLevel.PLATINUM_II]: "Platinum II",
    [TierLevel.PLATINUM_I]: "Platinum I",
    [TierLevel.DIAMOND_V]: "Diamond V",
    [TierLevel.DIAMOND_IV]: "Diamond IV",
    [TierLevel.DIAMOND_III]: "Diamond III",
    [TierLevel.DIAMOND_II]: "Diamond II",
    [TierLevel.DIAMOND_I]: "Diamond I",
    [TierLevel.RUBY_V]: "Ruby V",
    [TierLevel.RUBY_IV]: "Ruby IV",
    [TierLevel.RUBY_III]: "Ruby III",
    [TierLevel.RUBY_II]: "Ruby II",
    [TierLevel.RUBY_I]: "Ruby I",
    [TierLevel.MASTER]: "Master",
  }

  // 티어별 색상 코드
  private static readonly TIER_COLORS: Record<TierLevel, string> = {
    [TierLevel.UNRATED]: "#2D2D2D",
    [TierLevel.BRONZE_V]: "#AD5600",
    [TierLevel.BRONZE_IV]: "#AD5600",
    [TierLevel.BRONZE_III]: "#AD5600",
    [TierLevel.BRONZE_II]: "#AD5600",
    [TierLevel.BRONZE_I]: "#AD5600",
    [TierLevel.SILVER_V]: "#435F7A",
    [TierLevel.SILVER_IV]: "#435F7A",
    [TierLevel.SILVER_III]: "#435F7A",
    [TierLevel.SILVER_II]: "#435F7A",
    [TierLevel.SILVER_I]: "#435F7A",
    [TierLevel.GOLD_V]: "#EC9A00",
    [TierLevel.GOLD_IV]: "#EC9A00",
    [TierLevel.GOLD_III]: "#EC9A00",
    [TierLevel.GOLD_II]: "#EC9A00",
    [TierLevel.GOLD_I]: "#EC9A00",
    [TierLevel.PLATINUM_V]: "#27E2A4",
    [TierLevel.PLATINUM_IV]: "#27E2A4",
    [TierLevel.PLATINUM_III]: "#27E2A4",
    [TierLevel.PLATINUM_II]: "#27E2A4",
    [TierLevel.PLATINUM_I]: "#27E2A4",
    [TierLevel.DIAMOND_V]: "#00D2F0",
    [TierLevel.DIAMOND_IV]: "#00D2F0",
    [TierLevel.DIAMOND_III]: "#00D2F0",
    [TierLevel.DIAMOND_II]: "#00D2F0",
    [TierLevel.DIAMOND_I]: "#00D2F0",
    [TierLevel.RUBY_V]: "#FF0062",
    [TierLevel.RUBY_IV]: "#FF0062",
    [TierLevel.RUBY_III]: "#FF0062",
    [TierLevel.RUBY_II]: "#FF0062",
    [TierLevel.RUBY_I]: "#FF0062",
    [TierLevel.MASTER]: "#B491FF",
  }

  private constructor(level: TierLevel) {
    this.level = level
  }

  /**
   * 티어 레벨로부터 생성
   */
  public static ofLevel(level: TierLevel): Tier {
    return new Tier(level)
  }

  /**
   * solved.ac API 응답 숫자로부터 생성
   */
  public static fromApiResponse(tierNumber: number): Tier {
    if (tierNumber < 0 || tierNumber > 31) {
      throw new Error(`유효하지 않은 티어 번호입니다: ${tierNumber}`)
    }
    return new Tier(tierNumber as TierLevel)
  }

  /**
   * 티어 이름으로부터 생성
   */
  public static fromName(tierName: string): Tier {
    const entry = Object.entries(Tier.TIER_NAMES).find(([_, name]) => name === tierName)
    if (!entry) {
      throw new Error(`유효하지 않은 티어 이름입니다: ${tierName}`)
    }
    return new Tier(parseInt(entry[0]) as TierLevel)
  }

  /**
   * 다른 티어와 동등 비교
   */
  public equals(other: Tier): boolean {
    return this.level === other.level
  }

  /**
   * 티어 레벨 반환
   */
  public getLevel(): TierLevel {
    return this.level
  }

  /**
   * 티어 이름 반환
   */
  public getName(): string {
    return Tier.TIER_NAMES[this.level]
  }

  /**
   * 티어 색상 코드 반환
   */
  public getColor(): string {
    return Tier.TIER_COLORS[this.level]
  }

  /**
   * 원시 값(string) 반환 - 티어 이름 반환
   */
  public toString(): string {
    return this.getName()
  }

  /**
   * 티어 레벨 숫자 반환 (API 호환용)
   */
  public toNumber(): number {
    return this.level
  }

  /**
   * 브론즈 티어인지 확인
   */
  public isBronze(): boolean {
    return this.level >= TierLevel.BRONZE_V && this.level <= TierLevel.BRONZE_I
  }

  /**
   * 실버 티어인지 확인
   */
  public isSilver(): boolean {
    return this.level >= TierLevel.SILVER_V && this.level <= TierLevel.SILVER_I
  }

  /**
   * 골드 티어인지 확인
   */
  public isGold(): boolean {
    return this.level >= TierLevel.GOLD_V && this.level <= TierLevel.GOLD_I
  }

  /**
   * 플래티넘 티어인지 확인
   */
  public isPlatinum(): boolean {
    return this.level >= TierLevel.PLATINUM_V && this.level <= TierLevel.PLATINUM_I
  }

  /**
   * 다이아몬드 티어인지 확인
   */
  public isDiamond(): boolean {
    return this.level >= TierLevel.DIAMOND_V && this.level <= TierLevel.DIAMOND_I
  }

  /**
   * 루비 티어인지 확인
   */
  public isRuby(): boolean {
    return this.level >= TierLevel.RUBY_V && this.level <= TierLevel.RUBY_I
  }

  /**
   * 마스터 티어인지 확인
   */
  public isMaster(): boolean {
    return this.level === TierLevel.MASTER
  }

  /**
   * Unrated인지 확인
   */
  public isUnrated(): boolean {
    return this.level === TierLevel.UNRATED
  }

  /**
   * 멘토 자격을 충족하는지 확인 (Platinum 3 이상)
   */
  public isMentorEligible(): boolean {
    return this.level >= TierLevel.PLATINUM_III
  }

  /**
   * 다른 티어보다 높은지 비교
   */
  public isHigherThan(other: Tier): boolean {
    return this.level > other.level
  }

  /**
   * 다른 티어보다 낮은지 비교
   */
  public isLowerThan(other: Tier): boolean {
    return this.level < other.level
  }

  /**
   * 같은 티어 그룹인지 확인 (Bronze, Silver, Gold 등)
   */
  public isSameGroup(other: Tier): boolean {
    if (this.isBronze() && other.isBronze()) return true
    if (this.isSilver() && other.isSilver()) return true
    if (this.isGold() && other.isGold()) return true
    if (this.isPlatinum() && other.isPlatinum()) return true
    if (this.isDiamond() && other.isDiamond()) return true
    if (this.isRuby() && other.isRuby()) return true
    if (this.isMaster() && other.isMaster()) return true
    if (this.isUnrated() && other.isUnrated()) return true
    return false
  }

  /**
   * 티어 그룹 이름 반환
   */
  public getGroupName(): string {
    if (this.isUnrated()) return "Unrated"
    if (this.isBronze()) return "Bronze"
    if (this.isSilver()) return "Silver"
    if (this.isGold()) return "Gold"
    if (this.isPlatinum()) return "Platinum"
    if (this.isDiamond()) return "Diamond"
    if (this.isRuby()) return "Ruby"
    if (this.isMaster()) return "Master"
    return "Unknown"
  }

  /**
   * solved.ac 프로필 이미지 URL 생성
   */
  public getProfileImageUrl(): string {
    return `https://static.solved.ac/tier_small/${this.level}.svg`
  }
}
