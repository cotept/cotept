import { compile } from "path-to-regexp"

import { apiClient } from "./axios"
import { ApiResponse, DeleteRequest, GetRequest, PaginatedResponse, PostRequest, PutRequest } from "./types"

export abstract class BaseApiService {
  protected basePath: string

  constructor(basePath: string) {
    this.basePath = basePath
  }

  // GET 요청
  protected async get<T>(endpoint: string = "", request?: GetRequest): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, request?.params)
    return apiClient.get(url, { params: request?.query })
  }

  // GET 목록 (페이지네이션)
  protected async getList<T>(endpoint: string = "", request?: GetRequest): Promise<PaginatedResponse<T>> {
    const url = this.buildUrl(endpoint, request?.params)
    return apiClient.get(url, { params: request?.query })
  }

  // POST 요청
  protected async post<T, R = T>(endpoint: string = "", request: PostRequest<T>): Promise<ApiResponse<R>> {
    const url = this.buildUrl(endpoint, request.params)
    return apiClient.post(url, request.body)
  }

  // PUT 요청
  protected async put<T, R = T>(endpoint: string = "", request: PutRequest<T>): Promise<ApiResponse<R>> {
    const url = this.buildUrl(endpoint, request.params)
    return apiClient.put(url, request.body)
  }

  // DELETE 요청
  protected async delete<T = void>(endpoint: string = "", request: DeleteRequest): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, request.params)
    return apiClient.delete(url)
  }

  /**
   * API 엔드포인트와 파라미터를 결합하여 완전한 URL을 생성합니다.
   *
   * `path-to-regexp` 라이브러리를 사용하여 URL 파라미터(:id 등)를 안전하게 치환합니다.
   * 이를 통해 잘못된 치환으로 인한 버그를 방지하고 URL 인코딩을 보장합니다.
   *
   * @param endpoint - 기본 경로(basePath) 뒤에 추가될 엔드포인트 경로입니다. (예: "/:id/posts")
   * @param params - URL 경로에 포함될 파라미터 객체입니다. (예: { id: 123 })
   * @returns 파라미터가 적용된 완전한 URL 문자열을 반환합니다.
   *
   * @example
   * // basePath가 "/api/users"일 때
   * buildUrl("/:id", { id: 100 }); // 결과: "/api/users/100"
   * buildUrl("/:id/comments", { id: 100 }); // 결과: "/api/users/100/comments"
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const urlTemplate = `${this.basePath}${endpoint ? `/${endpoint}` : ""}`

    if (!params) {
      return urlTemplate
    }

    const toPath = compile(urlTemplate, { encode: encodeURIComponent })
    return toPath(params)
  }
}
