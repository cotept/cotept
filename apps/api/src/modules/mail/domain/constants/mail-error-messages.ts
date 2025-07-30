/**
 * 메일 모듈 에러 메시지 상수
 */
export const MAIL_ERROR_MESSAGES = {
  // 메일 전송 관련
  MAIL_SEND_FAILED: "메일 전송에 실패했습니다.",
  MAIL_SERVICE_UNAVAILABLE: "메일 서비스를 사용할 수 없습니다.",
  SMTP_CONNECTION_FAILED: "SMTP 서버 연결에 실패했습니다.",
  
  // 수신자 관련
  INVALID_RECIPIENT_EMAIL: "유효하지 않은 수신자 이메일 주소입니다.",
  NO_RECIPIENTS: "수신자가 지정되지 않았습니다.",
  TOO_MANY_RECIPIENTS: "수신자 수가 제한을 초과했습니다.",
  RECIPIENT_BLOCKED: "차단된 수신자입니다.",
  
  // 첨부파일 관련
  ATTACHMENT_TOO_LARGE: "첨부파일 크기가 제한을 초과했습니다.",
  TOO_MANY_ATTACHMENTS: "첨부파일 개수가 제한을 초과했습니다.",
  INVALID_ATTACHMENT_TYPE: "지원하지 않는 첨부파일 형식입니다.",
  ATTACHMENT_UPLOAD_FAILED: "첨부파일 업로드에 실패했습니다.",
  ATTACHMENT_NOT_FOUND: "첨부파일을 찾을 수 없습니다.",
  
  // 메일 내용 관련
  SUBJECT_TOO_LONG: "제목이 너무 깁니다.",
  BODY_TOO_LONG: "본문이 너무 깁니다.",
  EMPTY_SUBJECT: "제목이 비어있습니다.",
  EMPTY_BODY: "본문이 비어있습니다.",
  INVALID_HTML_CONTENT: "유효하지 않은 HTML 내용입니다.",
  
  // 메일 템플릿 관련
  TEMPLATE_NOT_FOUND: "메일 템플릿을 찾을 수 없습니다.",
  TEMPLATE_RENDER_FAILED: "메일 템플릿 렌더링에 실패했습니다.",
  INVALID_TEMPLATE_DATA: "유효하지 않은 템플릿 데이터입니다.",
  
  // 메일 감사 관련
  MAIL_AUDIT_NOT_FOUND: "메일 감사 기록을 찾을 수 없습니다.",
  AUDIT_LOG_ACCESS_DENIED: "감사 로그에 접근할 권한이 없습니다.",
  
  // 발송 제한 관련
  RATE_LIMIT_EXCEEDED: "메일 발송 제한을 초과했습니다.",
  DAILY_LIMIT_EXCEEDED: "일일 메일 발송 제한을 초과했습니다.",
  HOURLY_LIMIT_EXCEEDED: "시간당 메일 발송 제한을 초과했습니다.",
  
  // 보안 관련
  SUSPICIOUS_CONTENT_DETECTED: "의심스러운 내용이 감지되었습니다.",
  SPAM_FILTER_BLOCKED: "스팸 필터에 의해 차단되었습니다.",
  MALICIOUS_ATTACHMENT_DETECTED: "악성 첨부파일이 감지되었습니다.",
  
  // 일반적인 에러
  INVALID_REQUEST_DATA: "잘못된 요청 데이터입니다.",
  INTERNAL_SERVER_ERROR: "서버 내부 오류가 발생했습니다.",
  SERVICE_TEMPORARILY_UNAVAILABLE: "메일 서비스가 일시적으로 사용할 수 없습니다.",
} as const

export type MailErrorMessage = typeof MAIL_ERROR_MESSAGES[keyof typeof MAIL_ERROR_MESSAGES]