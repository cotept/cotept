import { Session, SessionStatus } from '../entities/session.entity';

/**
 * 세션 레포지토리 인터페이스
 * 도메인 관점에서의 데이터 액세스 추상화
 */
export interface ISessionRepository {
  /**
   * ID로 세션 조회
   */
  findById(id: string): Promise<Session | null>;
  
  /**
   * 새 세션 생성
   */
  create(session: Session): Promise<Session>;
  
  /**
   * 세션 업데이트
   */
  update(session: Session): Promise<Session>;
  
  /**
   * 세션 삭제
   */
  delete(id: string): Promise<boolean>;
  
  /**
   * 멘토의 세션 목록 조회
   */
  findByMentorId(mentorId: string): Promise<Session[]>;
  
  /**
   * 멘티의 세션 목록 조회
   */
  findByMenteeId(menteeId: string): Promise<Session[]>;
  
  /**
   * 특정 상태의 세션 목록 조회
   */
  findByStatus(status: SessionStatus): Promise<Session[]>;
  
  /**
   * 특정 기간 내의 세션 목록 조회
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<Session[]>;
}
