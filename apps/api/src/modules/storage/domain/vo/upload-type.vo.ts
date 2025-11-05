/**
 * 파일 업로드 타입 열거형
 * 각 타입은 고유한 저장 경로와 접근 권한을 가짐
 */
export enum UploadType {
  /**
   * 사용자 프로필 이미지
   * - 경로: public/users/{userId}/profile/
   * - 접근: 공개
   */
  USER_PROFILE = "USER_PROFILE",

  /**
   * 멘토 프로필 이미지
   * - 경로: public/mentors/{userId}/profile/
   * - 접근: 공개
   */
  MENTOR_PROFILE = "MENTOR_PROFILE",

  /**
   * 포트폴리오 이미지
   * - 경로: public/users/{userId}/portfolio/
   * - 접근: 공개
   */
  PORTFOLIO_IMAGE = "PORTFOLIO_IMAGE",

  /**
   * 멘토링 세션 녹화 파일
   * - 경로: private/sessions/{sessionId}/recordings/
   * - 접근: 인증된 참가자만
   */
  SESSION_RECORDING = "SESSION_RECORDING",

  /**
   * 멘토링 세션 문서/자료
   * - 경로: private/sessions/{sessionId}/documents/
   * - 접근: 인증된 참가자만
   */
  SESSION_DOCUMENT = "SESSION_DOCUMENT",

  /**
   * 사용자 개인 문서
   * - 경로: private/users/{userId}/documents/
   * - 접근: 본인만
   */
  USER_DOCUMENT = "USER_DOCUMENT",
}

/**
 * 업로드 타입별 공개 여부
 */
export const UPLOAD_TYPE_VISIBILITY: Record<UploadType, "public" | "private"> = {
  [UploadType.USER_PROFILE]: "public",
  [UploadType.MENTOR_PROFILE]: "public",
  [UploadType.PORTFOLIO_IMAGE]: "public",
  [UploadType.SESSION_RECORDING]: "private",
  [UploadType.SESSION_DOCUMENT]: "private",
  [UploadType.USER_DOCUMENT]: "private",
}

/**
 * 업로드 타입별 최대 파일 크기 (바이트)
 */
export const UPLOAD_TYPE_MAX_SIZE: Record<UploadType, number> = {
  [UploadType.USER_PROFILE]: 5 * 1024 * 1024, // 5MB
  [UploadType.MENTOR_PROFILE]: 5 * 1024 * 1024, // 5MB
  [UploadType.PORTFOLIO_IMAGE]: 10 * 1024 * 1024, // 10MB
  [UploadType.SESSION_RECORDING]: 500 * 1024 * 1024, // 500MB
  [UploadType.SESSION_DOCUMENT]: 20 * 1024 * 1024, // 20MB
  [UploadType.USER_DOCUMENT]: 20 * 1024 * 1024, // 20MB
}

/**
 * 업로드 타입별 허용 파일 확장자
 */
export const UPLOAD_TYPE_ALLOWED_EXTENSIONS: Record<UploadType, string[]> = {
  [UploadType.USER_PROFILE]: ["jpg", "jpeg", "png", "webp"],
  [UploadType.MENTOR_PROFILE]: ["jpg", "jpeg", "png", "webp"],
  [UploadType.PORTFOLIO_IMAGE]: ["jpg", "jpeg", "png", "webp", "gif"],
  [UploadType.SESSION_RECORDING]: ["mp4", "webm", "mkv"],
  [UploadType.SESSION_DOCUMENT]: ["pdf", "doc", "docx", "txt", "md"],
  [UploadType.USER_DOCUMENT]: ["pdf", "doc", "docx", "txt", "md", "zip"],
}
