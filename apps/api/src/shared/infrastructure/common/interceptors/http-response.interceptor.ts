import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"

import { Observable } from "rxjs"
import { map } from "rxjs/operators"

import { ApiResponse } from "@/shared/infrastructure/dto/api-response.dto"

@Injectable()
export class HttpResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    // HTTP/HTTPS 프로토콜인지 체크
    if (context.getType() !== "http") {
      // HTTP가 아니면 원본 데이터 그대로 반환 (WebSocket, RPC 등)
      return next.handle()
    }

    return next.handle().pipe(
      map((data) => {
        // 이미 ApiResponse 형태라면 그대로 반환
        if (data && typeof data === "object" && ("message" in data || "data" in data)) {
          return data as ApiResponse<T>
        }

        // 아니라면 ApiResponse로 래핑
        return ApiResponse.success(data)
      }),
    )
  }
}
