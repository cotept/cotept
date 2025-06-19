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

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    let url = `${this.basePath}${endpoint ? `/${endpoint}` : ""}`

    if (params) {
      Object.keys(params).forEach((key) => {
        url = url.replace(`:${key}`, params[key])
      })
    }

    return url
  }
}
