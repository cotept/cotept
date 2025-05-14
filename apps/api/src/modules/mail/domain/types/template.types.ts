export type LocaleType = "ko" | "en"
/**
 * 케어해 메일 템플릿 타입 정의 (스네이크 케이스)
 * 지원되는 모든 이메일 메시지 템플릿 이름
 */
export type TemplateNames =
  | "email_verification" // 이메일 본인확인
  | "password_recovery" // 비밀번호 찾기
  | "reservation_create" // 멘토링 예약 신청
  | "reservation_fix" // 멘토링 예약 확정
  | "reservation_cancel" // 멘토링 예약 취소
  | "reservation_change" // 멘토링 예약 변경
  | "reservation_prenotice" // 멘토링 사전안내
  | "verification_code" // 인증번호

export type AuthMailTemplateName = "email_verification" | "password_recovery" | "verification_code"
export type CommonMailTemplateName = Exclude<TemplateNames, AuthMailTemplateName>
export type ReservationMailTemplateName =
  | "reservation_create"
  | "reservation_fix"
  | "reservation_cancel"
  | "reservation_change"
  | "reservation_prenotice"

/**
 * 템플릿별 이메일 제목 맵핑
 */
export const TEMPLATE_SUBJECT_MAP = {
  email_verification: "[코테PT] 본인확인 이메일",
  password_recovery: "[코테PT] 비밀번호 찾기",
  reservation_create: "[코테PT] 멘토링 예약 신청",
  reservation_fix: "[코테PT] 멘토링 예약 확정",
  reservation_cancel: "[코테PT] 멘토링 예약 취소",
  reservation_change: "[코테PT] 멘토링 예약 변경",
  reservation_prenotice: "[코테PT] 멘토링 사전안내",
  verification_code: "[코테PT] 인증번호",
} as const

/**
 * 템플릿 이름과 해당 컨텍스트 타입 매핑 인터페이스
 * 각 템플릿 이름과 해당 컨텍스트 타입 간의 매핑을 정의 (스네이크 케이스 -> 파스칼 케이스Context)
 */
export interface TemplateContextMap {
  /** 이메일 본인확인 컨텍스트 */
  email_verification: IEmailVerificationContext
  /** 비밀번호 찾기 컨텍스트 */
  password_recovery: IPasswordRecoveryContext
  /** 멘토링 예약 신청 컨텍스트 */
  reservation_create: IReservationCreateContext
  /** 멘토링 예약 확정 컨텍스트 */
  reservation_fix: IReservationFixContext
  /** 멘토링 예약 취소 컨텍스트 */
  reservation_cancel: IReservationCancelContext
  /** 멘토링 예약 변경 컨텍스트 */
  reservation_change: IReservationChangeContext
  /** 멘토링 사전안내 컨텍스트 */
  reservation_prenotice: IReservationPrenoticeContext
  /** 인증번호 컨텍스트 */
  verification_code: IVerificationCodeContext
}

/**
 * 이메일 본인확인 컨텍스트
 * 이메일 본인확인용 인증번호 메일에 필요한 데이터 구조
 */
export interface IEmailVerificationContext {
  /** 인증번호 */
  authNumber: string
}

/**
 * 비밀번호 찾기 인증번호 이메일 컨텍스트
 * 비밀번호 찾기 과정에서 발송되는 메일에 필요한 데이터 구조
 */
export interface IPasswordRecoveryContext {
  /** 인증번호 */
  authNumber: string
}

/**
 * 멘토링 예약 신청 이메일 컨텍스트
 * 멘토링 예약 신청 시 발송되는 메일에 필요한 데이터 구조
 */
export interface IReservationCreateContext {
  /** 사용자 이름 */
  userName: string
  /** 멘토 이름 */
  mentorName?: string
  /** 예약 일시 */
  reservationDate: string
  /** 상담 주제 */
  topic?: string
}

/**
 * 멘토링 예약 확정 이메일 컨텍스트
 * 멘토링 예약이 확정되었을 때 발송되는 메일에 필요한 데이터 구조
 */
export interface IReservationFixContext {
  /** 사용자 이름 */
  userName: string
  /** 멘토 이름 */
  mentorName: string
  /** 예약 일시 */
  reservationDate: string
  /** 상담 주제 */
  topic?: string
  /** 추가 안내사항 */
  additionalInfo?: string
}

/**
 * 멘토링 예약 취소 이메일 컨텍스트
 * 멘토링 예약이 취소되었을 때 발송되는 메일에 필요한 데이터 구조
 */
export interface IReservationCancelContext {
  /** 사용자 이름 */
  userName: string
  /** 멘토 이름 */
  mentorName?: string
  /** 예약 일시 */
  reservationDate: string
  /** 취소 사유 */
  cancelReason?: string
}

/**
 * 멘토링 예약 변경 이메일 컨텍스트
 * 멘토링 예약이 변경되었을 때 발송되는 메일에 필요한 데이터 구조
 */
export interface IReservationChangeContext {
  /** 사용자 이름 */
  userName: string
  /** 멘토 이름 */
  mentorName?: string
  /** 기존 예약 일시 */
  oldReservationDate: string
  /** 변경된 예약 일시 */
  newReservationDate: string
  /** 변경 사유 */
  changeReason?: string
}

/**
 * 멘토링 사전안내 이메일 컨텍스트
 * 멘토링 예정일 전에 발송되는 사전안내 메일에 필요한 데이터 구조
 */
export interface IReservationPrenoticeContext {
  /** 사용자 이름 */
  userName: string
  /** 멘토 이름 */
  mentorName: string
  /** 예약 일시 */
  reservationDate: string
  /** 준비사항 */
  preparation?: string
  /** 상담 링크 */
  meetingLink?: string
}

/**
 * 인증번호 발송 이메일 컨텍스트
 * 인증번호 발송 메일에 필요한 데이터 구조
 */
export interface IVerificationCodeContext {
  /** 인증번호 */
  authNumber: string
}

/**
 * 이메일 옵션 인터페이스
 * 이메일 발송 요청 시 필요한 데이터 구조
 * @template T 템플릿 이름 타입
 */
export interface EmailOptions<T extends TemplateNames> {
  /** 수신자 이메일 주소 (단일 또는 복수) */
  to: string | string[]
  /** 언어 설정 (기본값: 'ko') */
  locale?: LocaleType
  /** 첨부 파일 배열 */
  attachments?: any[]
  /** 템플릿 이름 */
  template: T
  /** 템플릿에 전달할 데이터 */
  data: TemplateContextMap[T]
}

/**
 * 이메일 발송 서비스를 위한 헬퍼 타입
 * @template T 템플릿 이름 타입
 */
export type SendEmailOptions<T extends TemplateNames> = EmailOptions<T>
