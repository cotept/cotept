import { UPLOAD_TYPE_VISIBILITY,UploadType } from "@/modules/storage/domain/vo/upload-type.vo"

/**
 * 업로드 경로 생성 결과
 */
export interface UploadPathResult {
  /**
   * OCI Object Storage에 저장될 전체 경로
   * 예: public/users/123/profile/abc.png
   */
  objectName: string

  /**
   * 파일의 공개 여부
   */
  visibility: "public" | "private"
}

/**
 * 업로드 경로 생성 전략 인터페이스
 */
export interface UploadPathStrategy {
  /**
   * 업로드 타입에 따른 저장 경로 생성
   * @param userId 현재 사용자 ID
   * @param fileName 고유 파일명 (UUID 포함)
   * @param additionalContext 추가 컨텍스트 (세션 ID 등)
   */
  generatePath(userId: string, fileName: string, additionalContext?: Record<string, string>): UploadPathResult
}

/**
 * 사용자 프로필 이미지 경로 전략
 */
export class UserProfilePathStrategy implements UploadPathStrategy {
  generatePath(userId: string, fileName: string): UploadPathResult {
    return {
      objectName: `public/users/${userId}/profile/${fileName}`,
      visibility: "public",
    }
  }
}

/**
 * 멘토 프로필 이미지 경로 전략
 */
export class MentorProfilePathStrategy implements UploadPathStrategy {
  generatePath(userId: string, fileName: string): UploadPathResult {
    return {
      objectName: `public/mentors/${userId}/profile/${fileName}`,
      visibility: "public",
    }
  }
}

/**
 * 포트폴리오 이미지 경로 전략
 */
export class PortfolioImagePathStrategy implements UploadPathStrategy {
  generatePath(userId: string, fileName: string): UploadPathResult {
    return {
      objectName: `public/users/${userId}/portfolio/${fileName}`,
      visibility: "public",
    }
  }
}

/**
 * 멘토링 세션 녹화 파일 경로 전략
 */
export class SessionRecordingPathStrategy implements UploadPathStrategy {
  generatePath(userId: string, fileName: string, additionalContext?: Record<string, string>): UploadPathResult {
    const sessionId = additionalContext?.sessionId

    if (!sessionId) {
      throw new Error("Session ID is required for session recording uploads")
    }

    return {
      objectName: `private/sessions/${sessionId}/recordings/${fileName}`,
      visibility: "private",
    }
  }
}

/**
 * 멘토링 세션 문서 경로 전략
 */
export class SessionDocumentPathStrategy implements UploadPathStrategy {
  generatePath(userId: string, fileName: string, additionalContext?: Record<string, string>): UploadPathResult {
    const sessionId = additionalContext?.sessionId

    if (!sessionId) {
      throw new Error("Session ID is required for session document uploads")
    }

    return {
      objectName: `private/sessions/${sessionId}/documents/${fileName}`,
      visibility: "private",
    }
  }
}

/**
 * 사용자 개인 문서 경로 전략
 */
export class UserDocumentPathStrategy implements UploadPathStrategy {
  generatePath(userId: string, fileName: string): UploadPathResult {
    return {
      objectName: `private/users/${userId}/documents/${fileName}`,
      visibility: "private",
    }
  }
}

/**
 * 업로드 경로 전략 팩토리
 */
export class UploadPathStrategyFactory {
  private static strategies: Record<UploadType, UploadPathStrategy> = {
    [UploadType.USER_PROFILE]: new UserProfilePathStrategy(),
    [UploadType.MENTOR_PROFILE]: new MentorProfilePathStrategy(),
    [UploadType.PORTFOLIO_IMAGE]: new PortfolioImagePathStrategy(),
    [UploadType.SESSION_RECORDING]: new SessionRecordingPathStrategy(),
    [UploadType.SESSION_DOCUMENT]: new SessionDocumentPathStrategy(),
    [UploadType.USER_DOCUMENT]: new UserDocumentPathStrategy(),
  }

  /**
   * 업로드 타입에 맞는 경로 전략 반환
   */
  static getStrategy(uploadType: UploadType): UploadPathStrategy {
    const strategy = this.strategies[uploadType]

    if (!strategy) {
      throw new Error(`Unsupported upload type: ${uploadType}`)
    }

    return strategy
  }

  /**
   * 업로드 타입의 공개 여부 확인
   */
  static getVisibility(uploadType: UploadType): "public" | "private" {
    return UPLOAD_TYPE_VISIBILITY[uploadType]
  }
}
