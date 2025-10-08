import MentorProfile from "../mentor-profile"
import MentorTag, { MentorTagCategory } from "../mentor-tag"

describe("MentorProfile 도메인 모델 테스트", () => {
  let profile: MentorProfile

  beforeEach(() => {
    profile = new MentorProfile({ userId: "test-user" })
  })

  describe("프로필 완성도 계산 (calculateProfileCompletion)", () => {
    it("초기 상태에서는 0%여야 한다", () => {
      expect(profile.profileCompletion).toBe(0)
    })

    it("소개 제목만 있을 때 20%가 되어야 한다", () => {
      profile.updateIntroduction("테스트 제목", "")
      expect(profile.profileCompletion).toBe(20)
    })

    it("소개 내용만 있을 때 20%가 되어야 한다", () => {
      profile.updateIntroduction("", "테스트 내용")
      expect(profile.profileCompletion).toBe(20)
    })

    it("소개 제목과 내용이 모두 있을 때 40%가 되어야 한다", () => {
      profile.updateIntroduction("테스트 제목", "테스트 내용")
      expect(profile.profileCompletion).toBe(40)
    })

    it("직무 태그가 추가되면 20%가 추가되어야 한다", () => {
      const jobTag = new MentorTag({ name: "백엔드", category: MentorTagCategory.JOB })
      profile.addTag(jobTag)
      expect(profile.profileCompletion).toBe(20)
    })

    it("모든 카테고리의 태그가 추가되면 60%가 추가되어야 한다", () => {
      const jobTag = new MentorTag({ name: "백엔드", category: MentorTagCategory.JOB })
      const expTag = new MentorTag({ name: "3년차", category: MentorTagCategory.EXPERIENCE })
      const comTag = new MentorTag({ name: "네이버", category: MentorTagCategory.COMPANY })
      profile.addTag(jobTag).addTag(expTag).addTag(comTag)
      expect(profile.profileCompletion).toBe(60)
    })

    it("모든 정보가 채워졌을 때 100%가 되어야 한다", () => {
      profile.updateIntroduction("테스트 제목", "테스트 내용")
      const jobTag = new MentorTag({ name: "백엔드", category: MentorTagCategory.JOB })
      const expTag = new MentorTag({ name: "3년차", category: MentorTagCategory.EXPERIENCE })
      const comTag = new MentorTag({ name: "네이버", category: MentorTagCategory.COMPANY })
      profile.addTag(jobTag).addTag(expTag).addTag(comTag)
      expect(profile.profileCompletion).toBe(100)
    })
  })

  describe("멘토링 통계 업데이트 (updateMentoringStats)", () => {
    it("새로운 리뷰가 없을 때 멘토링 횟수만 1 증가해야 한다", () => {
      profile.updateMentoringStats()
      expect(profile.mentoringCount).toBe(1)
      expect(profile.totalReviewCount).toBe(0)
      expect(profile.averageRating).toBe(0)
    })

    it("새로운 평점이 주어졌을 때 모든 통계가 업데이트되어야 한다", () => {
      // 1차 업데이트
      profile.updateMentoringStats(5)
      expect(profile.mentoringCount).toBe(1)
      expect(profile.totalReviewCount).toBe(1)
      expect(profile.averageRating).toBe(5.0)

      // 2차 업데이트
      profile.updateMentoringStats(3)
      expect(profile.mentoringCount).toBe(2)
      expect(profile.totalReviewCount).toBe(2)
      expect(profile.averageRating).toBe(4.0) // (5 + 3) / 2

      // 3차 업데이트 (소수점 계산)
      profile.averageRating = 4.0
      profile.totalReviewCount = 2
      profile.updateMentoringStats(4)
      expect(profile.mentoringCount).toBe(3)
      expect(profile.totalReviewCount).toBe(3)
      expect(profile.averageRating).toBe(4.0) // (4*2 + 4) / 3 = 4
    })
  })

  describe("태그 관리", () => {
    it("태그를 추가할 수 있어야 한다", () => {
      const tag = new MentorTag({ name: "태그1", category: MentorTagCategory.JOB })
      profile.addTag(tag)
      expect(profile.tags).toHaveLength(1)
      expect(profile.tags[0].name).toBe("태그1")
    })

    it("중복된 태그는 추가되지 않아야 한다", () => {
      const tag = new MentorTag({ idx: 1, name: "태그1", category: MentorTagCategory.JOB })
      profile.addTag(tag)
      profile.addTag(tag) // 중복 추가 시도
      expect(profile.tags).toHaveLength(1)
    })

    it("태그를 제거할 수 있어야 한다", () => {
      const tag1 = new MentorTag({ idx: 1, name: "태그1", category: MentorTagCategory.JOB })
      const tag2 = new MentorTag({ idx: 2, name: "태그2", category: MentorTagCategory.JOB })
      profile.addTag(tag1).addTag(tag2)

      profile.removeTag(1) // idx로 제거

      expect(profile.tags).toHaveLength(1)
      expect(profile.tags[0].name).toBe("태그2")
    })
  })
})
