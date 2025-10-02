import { BadRequestException, HttpException, HttpStatus, NotFoundException } from "@nestjs/common"

/**
 * OCI Object Storage 예외 - 기본 클래스
 */
export class OciStorageException extends HttpException {
  constructor(message: string, statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(message, statusCode)
  }
}

/**
 * 파일 업로드 실패 예외
 */
export class FileUploadFailedException extends OciStorageException {
  constructor(message: string = "파일 업로드에 실패했습니다.") {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR)
  }
}

/**
 * 파일을 찾을 수 없음 예외
 */
export class FileNotFoundException extends NotFoundException {
  constructor(message: string = "요청한 파일을 찾을 수 없습니다.") {
    super(message)
  }
}

/**
 * 파일 다운로드 실패 예외
 */
export class FileDownloadFailedException extends OciStorageException {
  constructor(message: string = "파일 다운로드에 실패했습니다.") {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR)
  }
}

/**
 * 파일 삭제 실패 예외
 */
export class FileDeleteFailedException extends OciStorageException {
  constructor(message: string = "파일 삭제에 실패했습니다.") {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR)
  }
}

/**
 * 잘못된 파일 타입 예외
 */
export class InvalidFileTypeException extends BadRequestException {
  constructor(message: string = "지원하지 않는 파일 형식입니다.") {
    super(message)
  }
}

/**
 * 파일 크기 초과 예외
 */
export class FileSizeExceededException extends BadRequestException {
  constructor(message: string = "파일 크기가 제한을 초과했습니다.") {
    super(message)
  }
}

/**
 * PAR 생성 실패 예외
 */
export class PARCreationFailedException extends OciStorageException {
  constructor(message: string = "Pre-Authenticated Request 생성에 실패했습니다.") {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR)
  }
}

/**
 * PAR 삭제 실패 예외
 */
export class PARDeletionFailedException extends OciStorageException {
  constructor(message: string = "Pre-Authenticated Request 삭제에 실패했습니다.") {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR)
  }
}

/**
 * OCI 인증 실패 예외
 */
export class OciAuthenticationFailedException extends OciStorageException {
  constructor(message: string = "OCI 인증에 실패했습니다.") {
    super(message, HttpStatus.UNAUTHORIZED)
  }
}

/**
 * OCI 권한 부족 예외
 */
export class OciPermissionDeniedException extends OciStorageException {
  constructor(message: string = "OCI 리소스에 대한 권한이 없습니다.") {
    super(message, HttpStatus.FORBIDDEN)
  }
}

/**
 * OCI SDK 에러를 도메인 예외로 변환
 *
 * @param error OCI SDK에서 발생한 에러
 * @param context 에러 발생 컨텍스트 (예: 'upload', 'download')
 * @returns 변환된 도메인 예외
 */
export function mapOciErrorToDomainException(error: any, context: string): OciStorageException {
  const statusCode = error.statusCode || error.status || 500
  const message = error.message || "알 수 없는 오류가 발생했습니다."

  // 404: 파일을 찾을 수 없음
  if (statusCode === 404) {
    return new FileNotFoundException(`${context} 중 파일을 찾을 수 없습니다: ${message}`)
  }

  // 401: 인증 실패
  if (statusCode === 401) {
    return new OciAuthenticationFailedException(`${context} 중 인증 실패: ${message}`)
  }

  // 403: 권한 부족
  if (statusCode === 403) {
    return new OciPermissionDeniedException(`${context} 중 권한 부족: ${message}`)
  }

  // 400: 잘못된 요청
  if (statusCode === 400) {
    return new OciStorageException(`${context} 중 잘못된 요청: ${message}`, HttpStatus.BAD_REQUEST)
  }

  // 413: 파일 크기 초과
  if (statusCode === 413) {
    return new FileSizeExceededException(`${context} 중 파일 크기 초과: ${message}`)
  }

  // 컨텍스트별 기본 예외
  switch (context) {
    case "upload":
      return new FileUploadFailedException(`파일 업로드 실패: ${message}`)
    case "download":
      return new FileDownloadFailedException(`파일 다운로드 실패: ${message}`)
    case "delete":
      return new FileDeleteFailedException(`파일 삭제 실패: ${message}`)
    case "createPAR":
      return new PARCreationFailedException(`PAR 생성 실패: ${message}`)
    case "deletePAR":
      return new PARDeletionFailedException(`PAR 삭제 실패: ${message}`)
    default:
      return new OciStorageException(`${context} 중 오류 발생: ${message}`, statusCode)
  }
}
