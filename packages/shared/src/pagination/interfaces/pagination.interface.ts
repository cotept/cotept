// 1. 페이지네이션 관련 인터페이스 정의
export interface PaginationOptions {
  currentPage: number // 현재 페이지
  limit: number // 페이지당 항목 수
}

export interface PaginatedResult<T> {
  items: T[] // 현재 페이지 데이터
  totalItemCount: number // 전체 데이터 수
  currentPage: number // 현재 페이지
  limit: number // 페이지당 항목 수
  totalPageCount: number // 전체 페이지 수
}
