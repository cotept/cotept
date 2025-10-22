export enum TierNameEnum {
  Unrated = "Unrated",
  BronzeV = "BronzeV",
  BronzeIV = "BronzeIV",
  BronzeIII = "BronzeIII",
  BronzeII = "BronzeII",
  BronzeI = "BronzeI",
  SilverV = "SilverV",
  SilverIV = "SilverIV",
  SilverIII = "SilverIII",
  SilverII = "SilverII",
  SilverI = "SilverI",
  GoldV = "GoldV",
  GoldIV = "GoldIV",
  GoldIII = "GoldIII",
  GoldII = "GoldII",
  GoldI = "GoldI",
  PlatinumV = "PlatinumV",
  PlatinumIV = "PlatinumIV",
  PlatinumIII = "PlatinumIII",
  PlatinumII = "PlatinumII",
  PlatinumI = "PlatinumI",
  DiamondV = "DiamondV",
  DiamondIV = "DiamondIV",
  DiamondIII = "DiamondIII",
  DiamondII = "DiamondII",
  DiamondI = "DiamondI",
  RubyV = "RubyV",
  RubyIV = "RubyIV",
  RubyIII = "RubyIII",
  RubyII = "RubyII",
  RubyI = "RubyI",
  Master = "Master",
}

export enum TierColorEnum {
  Unrated = "#2D2D2D",
  BronzeV = "#AD5600",
  BronzeIV = "#AD5600",
  BronzeIII = "#AD5600",
  BronzeII = "#AD5600",
  BronzeI = "#AD5600",
  SilverV = "#435F7A",
  SilverIV = "#435F7A",
  SilverIII = "#435F7A",
  SilverII = "#435F7A",
  SilverI = "#435F7A",
  GoldV = "#EC9A00",
  GoldIV = "#EC9A00",
  GoldIII = "#EC9A00",
  GoldII = "#EC9A00",
  GoldI = "#EC9A00",
  PlatinumV = "#27E2A4",
  PlatinumIV = "#27E2A4",
  PlatinumIII = "#27E2A4",
  PlatinumII = "#27E2A4",
  PlatinumI = "#27E2A4",
  DiamondV = "#00D2F0",
  DiamondIV = "#00D2F0",
  DiamondIII = "#00D2F0",
  DiamondII = "#00D2F0",
  DiamondI = "#00D2F0",
  RubyV = "#FF0062",
  RubyIV = "#FF0062",
  RubyIII = "#FF0062",
  RubyII = "#FF0062",
  RubyI = "#FF0062",
  Master = "#B491FF",
}

/**
 * solved.ac 티어 값 객체
 * 백준 사용자의 solved.ac 티어 정보를 관리
 */
export enum TierLevelEnum {
  Unrated = 0,
  BronzeV = 1,
  BronzeIV = 2,
  BronzeIII = 3,
  BronzeII = 4,
  BronzeI = 5,
  SilverV = 6,
  SilverIV = 7,
  SilverIII = 8,
  SilverII = 9,
  SilverI = 10,
  GoldV = 11,
  GoldIV = 12,
  GoldIII = 13,
  GoldII = 14,
  GoldI = 15,
  PlatinumV = 16,
  PlatinumIV = 17,
  PlatinumIII = 18,
  PlatinumII = 19,
  PlatinumI = 20,
  DiamondV = 21,
  DiamondIV = 22,
  DiamondIII = 23,
  DiamondII = 24,
  DiamondI = 25,
  RubyV = 26,
  RubyIV = 27,
  RubyIII = 28,
  RubyII = 29,
  RubyI = 30,
  Master = 31,
}

export class Tier {
  private readonly level: TierLevelEnum

  // 티어별 이름 매핑
  private static readonly TIER_NAMES: Record<TierLevelEnum, TierNameEnum> = {
    [TierLevelEnum.Unrated]: TierNameEnum.Unrated,
    [TierLevelEnum.BronzeV]: TierNameEnum.BronzeV,
    [TierLevelEnum.BronzeIV]: TierNameEnum.BronzeIV,
    [TierLevelEnum.BronzeIII]: TierNameEnum.BronzeIII,
    [TierLevelEnum.BronzeII]: TierNameEnum.BronzeII,
    [TierLevelEnum.BronzeI]: TierNameEnum.BronzeI,
    [TierLevelEnum.SilverV]: TierNameEnum.SilverV,
    [TierLevelEnum.SilverIV]: TierNameEnum.SilverIV,
    [TierLevelEnum.SilverIII]: TierNameEnum.SilverIII,
    [TierLevelEnum.SilverII]: TierNameEnum.SilverII,
    [TierLevelEnum.SilverI]: TierNameEnum.SilverI,
    [TierLevelEnum.GoldV]: TierNameEnum.GoldV,
    [TierLevelEnum.GoldIV]: TierNameEnum.GoldIV,
    [TierLevelEnum.GoldIII]: TierNameEnum.GoldIII,
    [TierLevelEnum.GoldII]: TierNameEnum.GoldII,
    [TierLevelEnum.GoldI]: TierNameEnum.GoldI,
    [TierLevelEnum.PlatinumV]: TierNameEnum.PlatinumV,
    [TierLevelEnum.PlatinumIV]: TierNameEnum.PlatinumIV,
    [TierLevelEnum.PlatinumIII]: TierNameEnum.PlatinumIII,
    [TierLevelEnum.PlatinumII]: TierNameEnum.PlatinumII,
    [TierLevelEnum.PlatinumI]: TierNameEnum.PlatinumI,
    [TierLevelEnum.DiamondV]: TierNameEnum.DiamondV,
    [TierLevelEnum.DiamondIV]: TierNameEnum.DiamondIV,
    [TierLevelEnum.DiamondIII]: TierNameEnum.DiamondIII,
    [TierLevelEnum.DiamondII]: TierNameEnum.DiamondII,
    [TierLevelEnum.DiamondI]: TierNameEnum.DiamondI,
    [TierLevelEnum.RubyV]: TierNameEnum.RubyV,
    [TierLevelEnum.RubyIV]: TierNameEnum.RubyIV,
    [TierLevelEnum.RubyIII]: TierNameEnum.RubyIII,
    [TierLevelEnum.RubyII]: TierNameEnum.RubyII,
    [TierLevelEnum.RubyI]: TierNameEnum.RubyI,
    [TierLevelEnum.Master]: TierNameEnum.Master,
  }

  // 티어별 색상 코드
  private static readonly TIER_COLORS: Record<TierLevelEnum, TierColorEnum> = {
    [TierLevelEnum.Unrated]: TierColorEnum.Unrated,
    [TierLevelEnum.BronzeV]: TierColorEnum.BronzeV,
    [TierLevelEnum.BronzeIV]: TierColorEnum.BronzeIV,
    [TierLevelEnum.BronzeIII]: TierColorEnum.BronzeIII,
    [TierLevelEnum.BronzeII]: TierColorEnum.BronzeII,
    [TierLevelEnum.BronzeI]: TierColorEnum.BronzeI,
    [TierLevelEnum.SilverV]: TierColorEnum.SilverV,
    [TierLevelEnum.SilverIV]: TierColorEnum.SilverIV,
    [TierLevelEnum.SilverIII]: TierColorEnum.SilverIII,
    [TierLevelEnum.SilverII]: TierColorEnum.SilverII,
    [TierLevelEnum.SilverI]: TierColorEnum.SilverI,
    [TierLevelEnum.GoldV]: TierColorEnum.GoldV,
    [TierLevelEnum.GoldIV]: TierColorEnum.GoldIV,
    [TierLevelEnum.GoldIII]: TierColorEnum.GoldIII,
    [TierLevelEnum.GoldII]: TierColorEnum.GoldII,
    [TierLevelEnum.GoldI]: TierColorEnum.GoldI,
    [TierLevelEnum.PlatinumV]: TierColorEnum.PlatinumV,
    [TierLevelEnum.PlatinumIV]: TierColorEnum.PlatinumIV,
    [TierLevelEnum.PlatinumIII]: TierColorEnum.PlatinumIII,
    [TierLevelEnum.PlatinumII]: TierColorEnum.PlatinumII,
    [TierLevelEnum.PlatinumI]: TierColorEnum.PlatinumI,
    [TierLevelEnum.DiamondV]: TierColorEnum.DiamondV,
    [TierLevelEnum.DiamondIV]: TierColorEnum.DiamondIV,
    [TierLevelEnum.DiamondIII]: TierColorEnum.DiamondIII,
    [TierLevelEnum.DiamondII]: TierColorEnum.DiamondII,
    [TierLevelEnum.DiamondI]: TierColorEnum.DiamondI,
    [TierLevelEnum.RubyV]: TierColorEnum.RubyV,
    [TierLevelEnum.RubyIV]: TierColorEnum.RubyIV,
    [TierLevelEnum.RubyIII]: TierColorEnum.RubyIII,
    [TierLevelEnum.RubyII]: TierColorEnum.RubyII,
    [TierLevelEnum.RubyI]: TierColorEnum.RubyI,
    [TierLevelEnum.Master]: TierColorEnum.Master,
  }

  private constructor(level: TierLevelEnum) {
    this.level = level
  }

  /**
   * 티어 레벨로부터 생성
   */
  public static ofLevel(level: TierLevelEnum): Tier {
    return new Tier(level)
  }

  /**
   * solved.ac API 응답 숫자로부터 생성
   */
  public static fromApiResponse(tierNumber: number): Tier {
    if (tierNumber < 0 || tierNumber > 31) {
      throw new Error(`유효하지 않은 티어 번호입니다: ${tierNumber}`)
    }
    return new Tier(tierNumber as TierLevelEnum)
  }

  /**
   * 티어 이름으로부터 생성
   */
  public static fromName(tierNameETierNameEnum: string): Tier {
    const entry = Object.entries(Tier.TIER_NAMES).find(([_, name]) => name === tierNameETierNameEnum)
    if (!entry) {
      throw new Error(`유효하지 않은 티어 이름입니다: ${tierNameETierNameEnum}`)
    }
    return new Tier(parseInt(entry[0]) as TierLevelEnum)
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
  public getLevel(): TierLevelEnum {
    return this.level
  }

  /**
   * 티어 이름 반환
   */
  public getName(): TierNameEnum {
    return Tier.TIER_NAMES[this.level]
  }

  /**
   * 티어 색상 코드 반환
   */
  public getColor(): TierColorEnum {
    return Tier.TIER_COLORS[this.level]
  }

  /**
   * 원시 값(string) 반환 - 티어 이름 반환
   */
  public toString(): TierNameEnum {
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
    return this.level >= TierLevelEnum.BronzeV && this.level <= TierLevelEnum.BronzeI
  }

  /**
   * 실버 티어인지 확인
   */
  public isSilver(): boolean {
    return this.level >= TierLevelEnum.SilverV && this.level <= TierLevelEnum.SilverI
  }

  /**
   * 골드 티어인지 확인
   */
  public isGold(): boolean {
    return this.level >= TierLevelEnum.GoldV && this.level <= TierLevelEnum.GoldI
  }

  /**
   * 플래티넘 티어인지 확인
   */
  public isPlatinum(): boolean {
    return this.level >= TierLevelEnum.PlatinumV && this.level <= TierLevelEnum.PlatinumI
  }

  /**
   * 다이아몬드 티어인지 확인
   */
  public isDiamond(): boolean {
    return this.level >= TierLevelEnum.DiamondV && this.level <= TierLevelEnum.DiamondI
  }

  /**
   * 루비 티어인지 확인
   */
  public isRuby(): boolean {
    return this.level >= TierLevelEnum.RubyV && this.level <= TierLevelEnum.RubyI
  }

  /**
   * 마스터 티어인지 확인
   */
  public isMaster(): boolean {
    return this.level === TierLevelEnum.Master
  }

  /**
   * Unrated인지 확인
   */
  public isUnrated(): boolean {
    return this.level === TierLevelEnum.Unrated
  }

  /**
   * 멘토 자격을 충족하는지 확인 (Platinum 3 이상)
   */
  public isMentorEligible(): boolean {
    return this.level >= TierLevelEnum.PlatinumIII
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

  public static getAllTiers() {
    return Object.values(TierLevelEnum)
      .filter((level) => typeof level === "number")
      .map((level) => {
        const tier = Tier.ofLevel(level as TierLevelEnum)
        return {
          level: tier.getLevel(),
          name: tier.getName(),
          color: tier.getColor(),
        }
      })
  }
}
