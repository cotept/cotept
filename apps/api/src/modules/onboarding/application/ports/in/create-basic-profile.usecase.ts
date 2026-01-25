import { CreateBasicProfileDto } from "@/modules/onboarding/application/dtos/create-basic-profile.dto"
import { UserProfileDto } from "@/modules/user-profile/application/dtos"

/**
 * 기본 프로필 생성 유스케이스 인터페이스
 * 온보딩의 첫 단계인 기본 프로필 생성을 담당합니다.
 */
export abstract class CreateBasicProfileUseCase {
  abstract execute(dto: CreateBasicProfileDto): Promise<UserProfileDto>;
}
