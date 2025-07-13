import { Tier, TierLevel } from '../tier.vo'

describe('Tier', () => {
  describe('ofLevel 팩토리 메서드', () => {
    it('유효한 티어 레벨로 인스턴스를 생성해야 한다', () => {
      const tier = Tier.ofLevel(TierLevel.GOLD_III)
      expect(tier.getLevel()).toBe(TierLevel.GOLD_III)
      expect(tier.getName()).toBe('Gold III')
    })

    it('모든 티어 레벨에 대해 인스턴스를 생성할 수 있어야 한다', () => {
      Object.values(TierLevel).forEach(level => {
        if (typeof level === 'number') {
          expect(() => Tier.ofLevel(level)).not.toThrow()
        }
      })
    })
  })

  describe('fromApiResponse 팩토리 메서드', () => {
    it('유효한 API 응답 숫자로 인스턴스를 생성해야 한다', () => {
      const tier = Tier.fromApiResponse(13) // GOLD_III
      expect(tier.getLevel()).toBe(TierLevel.GOLD_III)
      expect(tier.getName()).toBe('Gold III')
    })

    it('0(UNRATED)에 대해 인스턴스를 생성해야 한다', () => {
      const tier = Tier.fromApiResponse(0)
      expect(tier.getLevel()).toBe(TierLevel.UNRATED)
      expect(tier.getName()).toBe('Unrated')
    })

    it('31(MASTER)에 대해 인스턴스를 생성해야 한다', () => {
      const tier = Tier.fromApiResponse(31)
      expect(tier.getLevel()).toBe(TierLevel.MASTER)
      expect(tier.getName()).toBe('Master')
    })

    it('유효 범위를 벗어난 숫자에 대해 에러를 던져야 한다', () => {
      expect(() => Tier.fromApiResponse(-1)).toThrow('유효하지 않은 티어 번호입니다: -1')
      expect(() => Tier.fromApiResponse(32)).toThrow('유효하지 않은 티어 번호입니다: 32')
    })
  })

  describe('fromName 팩토리 메서드', () => {
    it('유효한 티어 이름으로 인스턴스를 생성해야 한다', () => {
      const tier = Tier.fromName('Gold III')
      expect(tier.getLevel()).toBe(TierLevel.GOLD_III)
      expect(tier.getName()).toBe('Gold III')
    })

    it('모든 티어 이름에 대해 인스턴스를 생성할 수 있어야 한다', () => {
      const tierNames = [
        'Unrated', 'Bronze V', 'Bronze IV', 'Bronze III', 'Bronze II', 'Bronze I',
        'Silver V', 'Silver IV', 'Silver III', 'Silver II', 'Silver I',
        'Gold V', 'Gold IV', 'Gold III', 'Gold II', 'Gold I',
        'Platinum V', 'Platinum IV', 'Platinum III', 'Platinum II', 'Platinum I',
        'Diamond V', 'Diamond IV', 'Diamond III', 'Diamond II', 'Diamond I',
        'Ruby V', 'Ruby IV', 'Ruby III', 'Ruby II', 'Ruby I', 'Master'
      ]

      tierNames.forEach(name => {
        expect(() => Tier.fromName(name)).not.toThrow()
        const tier = Tier.fromName(name)
        expect(tier.getName()).toBe(name)
      })
    })

    it('유효하지 않은 티어 이름에 대해 에러를 던져야 한다', () => {
      expect(() => Tier.fromName('InvalidTier')).toThrow('유효하지 않은 티어 이름입니다: InvalidTier')
      expect(() => Tier.fromName('Gold VI')).toThrow('유효하지 않은 티어 이름입니다: Gold VI')
    })
  })

  describe('동등성 비교', () => {
    it('같은 레벨의 티어는 동등해야 한다', () => {
      const tier1 = Tier.ofLevel(TierLevel.GOLD_III)
      const tier2 = Tier.fromApiResponse(13)
      
      expect(tier1.equals(tier2)).toBe(true)
    })

    it('다른 레벨의 티어는 동등하지 않아야 한다', () => {
      const tier1 = Tier.ofLevel(TierLevel.GOLD_III)
      const tier2 = Tier.ofLevel(TierLevel.GOLD_II)
      
      expect(tier1.equals(tier2)).toBe(false)
    })
  })

  describe('티어 정보 조회', () => {
    let goldTier: Tier

    beforeEach(() => {
      goldTier = Tier.ofLevel(TierLevel.GOLD_III)
    })

    it('티어 레벨을 반환해야 한다', () => {
      expect(goldTier.getLevel()).toBe(TierLevel.GOLD_III)
    })

    it('티어 이름을 반환해야 한다', () => {
      expect(goldTier.getName()).toBe('Gold III')
    })

    it('티어 색상을 반환해야 한다', () => {
      expect(goldTier.getColor()).toBe('#EC9A00')
    })

    it('toString()이 티어 이름을 반환해야 한다', () => {
      expect(goldTier.toString()).toBe('Gold III')
    })

    it('toNumber()가 티어 레벨 숫자를 반환해야 한다', () => {
      expect(goldTier.toNumber()).toBe(13)
    })
  })

  describe('티어 그룹 확인', () => {
    it('브론즈 티어를 올바르게 확인해야 한다', () => {
      const bronzeTier = Tier.ofLevel(TierLevel.BRONZE_III)
      expect(bronzeTier.isBronze()).toBe(true)
      expect(bronzeTier.isSilver()).toBe(false)
      expect(bronzeTier.isGold()).toBe(false)
    })

    it('실버 티어를 올바르게 확인해야 한다', () => {
      const silverTier = Tier.ofLevel(TierLevel.SILVER_II)
      expect(silverTier.isSilver()).toBe(true)
      expect(silverTier.isBronze()).toBe(false)
      expect(silverTier.isGold()).toBe(false)
    })

    it('골드 티어를 올바르게 확인해야 한다', () => {
      const goldTier = Tier.ofLevel(TierLevel.GOLD_I)
      expect(goldTier.isGold()).toBe(true)
      expect(goldTier.isSilver()).toBe(false)
      expect(goldTier.isPlatinum()).toBe(false)
    })

    it('플래티넘 티어를 올바르게 확인해야 한다', () => {
      const platinumTier = Tier.ofLevel(TierLevel.PLATINUM_IV)
      expect(platinumTier.isPlatinum()).toBe(true)
      expect(platinumTier.isGold()).toBe(false)
      expect(platinumTier.isDiamond()).toBe(false)
    })

    it('다이아몬드 티어를 올바르게 확인해야 한다', () => {
      const diamondTier = Tier.ofLevel(TierLevel.DIAMOND_II)
      expect(diamondTier.isDiamond()).toBe(true)
      expect(diamondTier.isPlatinum()).toBe(false)
      expect(diamondTier.isRuby()).toBe(false)
    })

    it('루비 티어를 올바르게 확인해야 한다', () => {
      const rubyTier = Tier.ofLevel(TierLevel.RUBY_I)
      expect(rubyTier.isRuby()).toBe(true)
      expect(rubyTier.isDiamond()).toBe(false)
      expect(rubyTier.isMaster()).toBe(false)
    })

    it('마스터 티어를 올바르게 확인해야 한다', () => {
      const masterTier = Tier.ofLevel(TierLevel.MASTER)
      expect(masterTier.isMaster()).toBe(true)
      expect(masterTier.isRuby()).toBe(false)
      expect(masterTier.isUnrated()).toBe(false)
    })

    it('Unrated를 올바르게 확인해야 한다', () => {
      const unratedTier = Tier.ofLevel(TierLevel.UNRATED)
      expect(unratedTier.isUnrated()).toBe(true)
      expect(unratedTier.isBronze()).toBe(false)
      expect(unratedTier.isMaster()).toBe(false)
    })
  })

  describe('멘토 자격 확인', () => {
    it('Platinum III 이상 티어는 멘토 자격이 있어야 한다', () => {
      expect(Tier.ofLevel(TierLevel.PLATINUM_III).isMentorEligible()).toBe(true)
      expect(Tier.ofLevel(TierLevel.PLATINUM_II).isMentorEligible()).toBe(true)
      expect(Tier.ofLevel(TierLevel.PLATINUM_I).isMentorEligible()).toBe(true)
      expect(Tier.ofLevel(TierLevel.DIAMOND_V).isMentorEligible()).toBe(true)
      expect(Tier.ofLevel(TierLevel.RUBY_I).isMentorEligible()).toBe(true)
      expect(Tier.ofLevel(TierLevel.MASTER).isMentorEligible()).toBe(true)
    })

    it('Platinum III 미만 티어는 멘토 자격이 없어야 한다', () => {
      expect(Tier.ofLevel(TierLevel.UNRATED).isMentorEligible()).toBe(false)
      expect(Tier.ofLevel(TierLevel.BRONZE_I).isMentorEligible()).toBe(false)
      expect(Tier.ofLevel(TierLevel.SILVER_I).isMentorEligible()).toBe(false)
      expect(Tier.ofLevel(TierLevel.GOLD_I).isMentorEligible()).toBe(false)
      expect(Tier.ofLevel(TierLevel.PLATINUM_V).isMentorEligible()).toBe(false)
      expect(Tier.ofLevel(TierLevel.PLATINUM_IV).isMentorEligible()).toBe(false)
    })
  })

  describe('티어 비교', () => {
    it('더 높은 티어를 올바르게 확인해야 한다', () => {
      const goldTier = Tier.ofLevel(TierLevel.GOLD_I)
      const silverTier = Tier.ofLevel(TierLevel.SILVER_I)
      
      expect(goldTier.isHigherThan(silverTier)).toBe(true)
      expect(silverTier.isHigherThan(goldTier)).toBe(false)
    })

    it('더 낮은 티어를 올바르게 확인해야 한다', () => {
      const bronzeTier = Tier.ofLevel(TierLevel.BRONZE_III)
      const silverTier = Tier.ofLevel(TierLevel.SILVER_II)
      
      expect(bronzeTier.isLowerThan(silverTier)).toBe(true)
      expect(silverTier.isLowerThan(bronzeTier)).toBe(false)
    })

    it('같은 티어끼리는 더 높지도 낮지도 않아야 한다', () => {
      const tier1 = Tier.ofLevel(TierLevel.GOLD_III)
      const tier2 = Tier.ofLevel(TierLevel.GOLD_III)
      
      expect(tier1.isHigherThan(tier2)).toBe(false)
      expect(tier1.isLowerThan(tier2)).toBe(false)
    })
  })

  describe('같은 티어 그룹 확인', () => {
    it('같은 브론즈 그룹 티어들은 같은 그룹으로 인식해야 한다', () => {
      const bronze1 = Tier.ofLevel(TierLevel.BRONZE_V)
      const bronze2 = Tier.ofLevel(TierLevel.BRONZE_I)
      
      expect(bronze1.isSameGroup(bronze2)).toBe(true)
    })

    it('다른 티어 그룹들은 같은 그룹으로 인식하지 않아야 한다', () => {
      const bronze = Tier.ofLevel(TierLevel.BRONZE_I)
      const silver = Tier.ofLevel(TierLevel.SILVER_V)
      
      expect(bronze.isSameGroup(silver)).toBe(false)
    })

    it('Unrated는 다른 티어와 같은 그룹이 아니어야 한다', () => {
      const unrated = Tier.ofLevel(TierLevel.UNRATED)
      const bronze = Tier.ofLevel(TierLevel.BRONZE_V)
      
      expect(unrated.isSameGroup(bronze)).toBe(false)
    })
  })

  describe('티어 그룹 이름', () => {
    it('올바른 티어 그룹 이름을 반환해야 한다', () => {
      expect(Tier.ofLevel(TierLevel.UNRATED).getGroupName()).toBe('Unrated')
      expect(Tier.ofLevel(TierLevel.BRONZE_III).getGroupName()).toBe('Bronze')
      expect(Tier.ofLevel(TierLevel.SILVER_II).getGroupName()).toBe('Silver')
      expect(Tier.ofLevel(TierLevel.GOLD_I).getGroupName()).toBe('Gold')
      expect(Tier.ofLevel(TierLevel.PLATINUM_IV).getGroupName()).toBe('Platinum')
      expect(Tier.ofLevel(TierLevel.DIAMOND_V).getGroupName()).toBe('Diamond')
      expect(Tier.ofLevel(TierLevel.RUBY_I).getGroupName()).toBe('Ruby')
      expect(Tier.ofLevel(TierLevel.MASTER).getGroupName()).toBe('Master')
    })
  })

  describe('프로필 이미지 URL', () => {
    it('올바른 프로필 이미지 URL을 생성해야 한다', () => {
      const goldTier = Tier.ofLevel(TierLevel.GOLD_III)
      const expectedUrl = 'https://static.solved.ac/tier_small/13.svg'
      
      expect(goldTier.getProfileImageUrl()).toBe(expectedUrl)
    })

    it('모든 티어에 대해 유효한 URL을 생성해야 한다', () => {
      Object.values(TierLevel).forEach(level => {
        if (typeof level === 'number') {
          const tier = Tier.ofLevel(level)
          const url = tier.getProfileImageUrl()
          
          expect(url).toMatch(/^https:\/\/static\.solved\.ac\/tier_small\/\d+\.svg$/)
          expect(url).toContain(level.toString())
        }
      })
    })
  })

  describe('티어 색상', () => {
    it('각 티어 그룹별로 올바른 색상을 가져야 한다', () => {
      // 브론즈
      expect(Tier.ofLevel(TierLevel.BRONZE_V).getColor()).toBe('#AD5600')
      
      // 실버
      expect(Tier.ofLevel(TierLevel.SILVER_III).getColor()).toBe('#435F7A')
      
      // 골드
      expect(Tier.ofLevel(TierLevel.GOLD_II).getColor()).toBe('#EC9A00')
      
      // 플래티넘
      expect(Tier.ofLevel(TierLevel.PLATINUM_I).getColor()).toBe('#27E2A4')
      
      // 다이아몬드
      expect(Tier.ofLevel(TierLevel.DIAMOND_IV).getColor()).toBe('#00D2F0')
      
      // 루비
      expect(Tier.ofLevel(TierLevel.RUBY_II).getColor()).toBe('#FF0062')
      
      // 마스터
      expect(Tier.ofLevel(TierLevel.MASTER).getColor()).toBe('#B491FF')
      
      // Unrated
      expect(Tier.ofLevel(TierLevel.UNRATED).getColor()).toBe('#2D2D2D')
    })
  })

  describe('경계값 테스트', () => {
    it('각 티어 그룹의 경계값을 올바르게 처리해야 한다', () => {
      // 브론즈 경계
      expect(Tier.ofLevel(TierLevel.BRONZE_V).isBronze()).toBe(true)
      expect(Tier.ofLevel(TierLevel.BRONZE_I).isBronze()).toBe(true)
      
      // 실버 경계
      expect(Tier.ofLevel(TierLevel.SILVER_V).isSilver()).toBe(true)
      expect(Tier.ofLevel(TierLevel.SILVER_I).isSilver()).toBe(true)
      
      // 멘토 자격 경계
      expect(Tier.ofLevel(TierLevel.PLATINUM_IV).isMentorEligible()).toBe(false)
      expect(Tier.ofLevel(TierLevel.PLATINUM_III).isMentorEligible()).toBe(true)
    })
  })
})