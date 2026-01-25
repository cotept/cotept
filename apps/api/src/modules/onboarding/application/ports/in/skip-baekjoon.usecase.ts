import { SkipBaekjoonDto, SkipBaekjoonResponseDto } from "@/modules/onboarding/application/dtos/skip-baekjoon.dto"

/**
 * 백준 연동 건너뛰기 유스케이스 인터페이스
 * 사용자가 백준 연동 없이 온보딩을 완료할 수 있도록 합니다.
 */
export abstract class SkipBaekjoonUseCase {
  abstract execute(dto: SkipBaekjoonDto): Promise<SkipBaekjoonResponseDto>
}
