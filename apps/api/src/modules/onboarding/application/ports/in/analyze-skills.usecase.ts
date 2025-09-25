import { TagStatisticsOutputDto } from "@/modules/baekjoon/application/dtos"
import { AnalyzeSkillsDto } from "@/modules/onboarding/application/dtos/analyze-skills.dto"

/**
 * 실력 분석 유스케이스 인터페이스
 */
export abstract class AnalyzeSkillsUseCase {
  abstract execute(dto: AnalyzeSkillsDto): Promise<TagStatisticsOutputDto>
}
