// / session-problem.interface.ts
export interface ISessionProblem {
  id: string
  sessionId: string
  problemId: string // 백준 문제 ID
  initialCode?: string // 멘티가 처음 가져온 코드
  finalCode?: string // 멘토링 후 최종 코드
  notes?: string // 문제에 대한 노트
  createdAt: Date
  updatedAt: Date
}
