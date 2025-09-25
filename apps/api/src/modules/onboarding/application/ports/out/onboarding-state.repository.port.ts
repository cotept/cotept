import OnboardingState from "@/modules/onboarding/domain/model/onboarding-state.model"

/**
 * 온보딩 상태 저장소 인터페이스 (아웃바운드 포트)
 * 온보딩 상태의 영속성을 관리합니다.
 */
export abstract class OnboardingStateRepositoryPort {
  /**
   * 사용자 ID로 온보딩 상태를 조회합니다.
   * @param userId 사용자 ID
   * @returns 온보딩 상태 도메인 모델 또는 null
   */
  abstract findByUserId(userId: string): Promise<OnboardingState | null>

  /**
   * 온보딩 상태를 저장합니다. (생성 또는 업데이트)
   * @param state 저장할 온보딩 상태 도메인 모델
   * @returns 저장된 온보딩 상태 도메인 모델
   */
  abstract save(state: OnboardingState): Promise<OnboardingState>
}
