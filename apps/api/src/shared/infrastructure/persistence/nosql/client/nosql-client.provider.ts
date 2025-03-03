import { Provider } from "@nestjs/common"
import { NoSQLClient } from "oracle-nosqldb"
import { NoSQLClientOptions } from "./nosql-client.interface"

export const OCI_NOSQL_CLIENT = "OCI_NOSQL_CLIENT"
export const OCI_NOSQL_OPTIONS = "OCI_NOSQL_OPTIONS"

/**
 * OCI NoSQL 클라이언트 프로바이더
 */
export const NoSQLClientProvider: Provider = {
  provide: OCI_NOSQL_CLIENT,
  useFactory: async (options: NoSQLClientOptions) => {
    try {
      const client = new NoSQLClient(options)

      // 연결 테스트 (선택적)
      // const testResult = await client.getTable('system:tables');

      console.log("[NoSQL] OCI NoSQL 클라이언트가 성공적으로 초기화되었습니다.")
      return client
    } catch (error) {
      console.error("[NoSQL] OCI NoSQL 클라이언트 초기화 실패:", error)
      throw error
    }
  },
  inject: [OCI_NOSQL_OPTIONS],
}

/**
 * OCI NoSQL 옵션 프로바이더
 */
export const createNoSQLOptionsProvider = (options: NoSQLClientOptions): Provider => ({
  provide: OCI_NOSQL_OPTIONS,
  useValue: options,
})
