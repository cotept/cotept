import { MyProfileResponseDto } from "@/modules/user-profile/infrastructure/adapter/in/dto/response"

/**
 * 내 프로필 정보 조회 유스케이스
 * 현재 로그인한 사용자의 멘티 프로필 + 멘토 프로필 보유 여부
 */
export abstract class GetMyProfileUseCase {
  abstract execute(userId: string): Promise<MyProfileResponseDto>
}
