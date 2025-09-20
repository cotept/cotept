export interface DeleteMentorProfileUseCase {
  execute(idx: number): Promise<void>
}
