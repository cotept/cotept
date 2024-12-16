export enum RegistrationStatus {
  INITIATED = "INITIATED", // 회원가입 시작
  TERMS_AGREED = "TERMS_AGREED", // 약관 동의 완료
  PHONE_VERIFIED = "PHONE_VERIFIED", // 전화번호 인증 완료
  INFO_SUBMITTED = "INFO_SUBMITTED", // 기본 정보 입력 완료
  EMAIL_VERIFIED = "EMAIL_VERIFIED", // 이메일 인증 완료
  BOJ_VERIFIED = "BOJ_VERIFIED", // 백준 ID 인증 완료
  COMPLETED = "COMPLETED", // 회원가입 완료
}
