export abstract class DeleteMentorProfileUseCase {
  abstract execute(idx: number): Promise<void>
}
