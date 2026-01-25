/**
 * 백준 모듈 에러 메시지 상수
 */
export const BAEKJOON_ERROR_MESSAGES = {
  // 사용자 프로필 관련
  BAEKJOON_USER_NOT_FOUND: "백준 사용자를 찾을 수 없습니다.",
  INVALID_BAEKJOON_USERNAME: "유효하지 않은 백준 사용자명입니다.",
  BAEKJOON_PROFILE_NOT_FOUND: "백준 프로필을 찾을 수 없습니다.",
  PROFILE_ALREADY_EXISTS: "이미 등록된 백준 프로필입니다.",
  
  // 인증 관련
  VERIFICATION_NOT_STARTED: "인증이 시작되지 않았습니다.",
  VERIFICATION_ALREADY_COMPLETED: "이미 인증이 완료되었습니다.",
  VERIFICATION_EXPIRED: "인증 시간이 만료되었습니다.",
  VERIFICATION_FAILED: "백준 계정 인증에 실패했습니다.",
  VERIFICATION_CODE_NOT_FOUND: "인증 코드를 찾을 수 없습니다.",
  INVALID_VERIFICATION_CODE: "유효하지 않은 인증 코드입니다.",
  
  // Solved.ac API 관련
  SOLVED_AC_API_ERROR: "Solved.ac API 호출에 실패했습니다.",
  SOLVED_AC_USER_NOT_FOUND: "Solved.ac에서 사용자를 찾을 수 없습니다.",
  SOLVED_AC_RATE_LIMITED: "Solved.ac API 호출 제한에 도달했습니다.",
  SOLVED_AC_SERVICE_UNAVAILABLE: "Solved.ac 서비스를 사용할 수 없습니다.",
  SOLVED_AC_TIMEOUT: "Solved.ac API 응답 시간이 초과되었습니다.",
  
  // 통계 관련
  STATISTICS_NOT_AVAILABLE: "통계 정보를 가져올 수 없습니다.",
  STATISTICS_UPDATE_FAILED: "통계 정보 업데이트에 실패했습니다.",
  OUTDATED_STATISTICS: "통계 정보가 오래되었습니다.",
  
  // 문제 정보 관련
  PROBLEM_NOT_FOUND: "문제 정보를 찾을 수 없습니다.",
  PROBLEM_DATA_INVALID: "유효하지 않은 문제 데이터입니다.",
  SUBMISSION_NOT_FOUND: "제출 정보를 찾을 수 없습니다.",
  
  // 크롤링 관련
  CRAWLING_FAILED: "데이터 크롤링에 실패했습니다.",
  CRAWLING_BLOCKED: "크롤링이 차단되었습니다.",
  CRAWLING_RATE_LIMITED: "크롤링 속도 제한에 도달했습니다.",
  
  // 동기화 관련
  SYNC_IN_PROGRESS: "동기화가 진행 중입니다.",
  SYNC_FAILED: "데이터 동기화에 실패했습니다.",
  SYNC_TIMEOUT: "동기화 시간이 초과되었습니다.",
  
  // 외부 서비스 관련
  EXTERNAL_API_ERROR: "외부 API 호출에 실패했습니다.",
  NETWORK_ERROR: "네트워크 오류가 발생했습니다.",
  SERVICE_MAINTENANCE: "외부 서비스가 점검 중입니다.",
  
  // 데이터 유효성 관련
  INVALID_RANKING_DATA: "유효하지 않은 랭킹 데이터입니다.",
  INVALID_TIER_DATA: "유효하지 않은 티어 데이터입니다.",
  DATA_CORRUPTION_DETECTED: "데이터 손상이 감지되었습니다.",
  
  // 일반적인 에러
  INVALID_REQUEST_DATA: "잘못된 요청 데이터입니다.",
  INTERNAL_SERVER_ERROR: "서버 내부 오류가 발생했습니다.",
  SERVICE_TEMPORARILY_UNAVAILABLE: "백준 서비스가 일시적으로 사용할 수 없습니다.",
} as const

export type BaekjoonErrorMessage = typeof BAEKJOON_ERROR_MESSAGES[keyof typeof BAEKJOON_ERROR_MESSAGES]