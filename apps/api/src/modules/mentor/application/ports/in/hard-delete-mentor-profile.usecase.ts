export interface HardDeleteMentorProfileUseCase {
  execute(idx: number): Promise<void>
}
