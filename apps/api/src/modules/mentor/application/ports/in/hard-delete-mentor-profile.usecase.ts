export abstract class HardDeleteMentorProfileUseCase {
  abstract execute(idx: number): Promise<void>
}
