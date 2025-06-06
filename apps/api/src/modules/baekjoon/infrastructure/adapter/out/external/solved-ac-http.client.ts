import { ErrorUtils } from "@/shared/utils/error.util"
import { HttpService } from "@nestjs/axios"
import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { AxiosError, AxiosResponse } from "axios"
import { firstValueFrom, timeout } from "rxjs"

/**
 * solved.ac HTTP 클라이언트
 * solved.ac API와의 HTTP 통신을 담당하는 클래스
 */
@Injectable()
export class SolvedAcHttpClient {
  private readonly logger = new Logger(SolvedAcHttpClient.name)
  private readonly baseUrl: string
  private readonly timeoutMs: number
  private readonly maxRetries: number

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>("SOLVED_AC_API_BASE_URL", "https://solved.ac/api/v3")
    this.timeoutMs = this.configService.get<number>("SOLVED_AC_API_TIMEOUT", 10000)
    this.maxRetries = this.configService.get<number>("SOLVED_AC_API_MAX_RETRIES", 1)
  }

  /**
   * GET 요청을 수행합니다
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    this.logger.debug(`[GET] ${url}`, { params })

    try {
      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService
          .get<T>(url, {
            params,
            timeout: this.timeoutMs,
          })
          .pipe(
            timeout(this.timeoutMs + 1000), // HTTP timeout + 1초 여유
          ),
      )

      this.logger.debug(`[GET] ${url} - Success`, {
        status: response.status,
        dataSize: JSON.stringify(response.data).length,
      })

      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`[GET] ${url} - Failed`, {
          error: ErrorUtils.getErrorMessage(error),
          status: error.response?.status,
          data: error.response?.data,
          params,
        })
      }

      throw this.transformError(error, endpoint)
    }
  }

  /**
   * 에러를 적절한 비즈니스 예외로 변환합니다
   */
  private transformError(error: any, endpoint: string): Error {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message

    if (status === 404) {
      return new Error(`사용자를 찾을 수 없습니다: ${message}`)
    }

    if (status === 429) {
      return new Error("API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.")
    }

    if (status >= 500) {
      return new Error("solved.ac 서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.")
    }

    return new Error(`solved.ac API 호출 중 오류가 발생했습니다: ${message}`)
  }
}
