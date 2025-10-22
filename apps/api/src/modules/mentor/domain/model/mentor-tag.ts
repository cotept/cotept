/**
 * 멘토 태그 카테고리 열거형
 * 직무, 연차, 회사 정보를 분류하는 카테고리
 */
export enum MentorTagCategory {
  JOB = "job",
  EXPERIENCE = "experience",
  COMPANY = "company",
}

/**
 * 멘토 태그 도메인 모델
 * 멘토의 직무, 연차, 회사 정보를 나타내는 태그
 */
export default class MentorTag {
  idx?: number
  name: string
  category: MentorTagCategory
  displayOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date

  constructor(params: {
    idx?: number
    name: string
    category: MentorTagCategory
    displayOrder?: number
    isActive?: boolean
    createdAt?: Date
    updatedAt?: Date
  }) {
    this.idx = params.idx
    this.name = params.name
    this.category = params.category
    this.displayOrder = params.displayOrder ?? 0
    this.isActive = params.isActive ?? true
    this.createdAt = params.createdAt || new Date()
    this.updatedAt = params.updatedAt || new Date()
  }

  /**
   * 태그를 활성화합니다.
   */
  activate(): MentorTag {
    this.isActive = true
    this.updatedAt = new Date()
    return this
  }

  /**
   * 태그를 비활성화합니다.
   */
  deactivate(): MentorTag {
    this.isActive = false
    this.updatedAt = new Date()
    return this
  }

  /**
   * 표시 순서를 변경합니다.
   */
  updateDisplayOrder(order: number): MentorTag {
    this.displayOrder = order
    this.updatedAt = new Date()
    return this
  }

  /**
   * 태그 이름을 변경합니다.
   */
  updateName(newName: string): MentorTag {
    if (!newName.trim()) {
      throw new Error("태그 이름은 비어있을 수 없습니다.")
    }
    this.name = newName.trim()
    this.updatedAt = new Date()
    return this
  }

  /**
   * 태그가 활성 상태인지 확인합니다.
   */
  isActiveTag(): boolean {
    return this.isActive
  }

  /**
   * 정적 팩토리 메서드: 새 태그를 생성합니다.
   */
  static create(params: {
    name: string
    category: MentorTagCategory
    displayOrder?: number
  }): MentorTag {
    if (!params.name.trim()) {
      throw new Error("태그 이름은 비어있을 수 없습니다.")
    }

    return new MentorTag({
      name: params.name.trim(),
      category: params.category,
      displayOrder: params.displayOrder ?? 0,
      isActive: true,
    })
  }
}