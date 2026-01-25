import { Module, Type } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

import { NoSQLModule } from "./nosql.module"

import { ConfigModule } from "@/configs/config.module"
import { NoSQLClientConfig, NoSQLConnectionConfig } from "@/configs/nosql/nosql.config"
import { OCIAuthConfig } from "@/configs/oci/oci.config"

@Module({
  imports: [
    NoSQLModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // 설정 가져오기
        const nosqlConnection = configService.getOrThrow<NoSQLConnectionConfig>("nosql.connection")
        const nosqlClient = configService.getOrThrow<NoSQLClientConfig>("nosql.client")

        // 온프레미스 연결인지 확인 (localhost 또는 http 프로토콜)
        const isOnPremise =
          nosqlConnection.endpoint.includes("localhost") || nosqlConnection.endpoint.startsWith("http://")

        if (isOnPremise) {
          // 온프레미스 연결 설정
          return {
            serviceType: "KVSTORE",
            endpoint: nosqlConnection.endpoint,
            timeout: nosqlClient.timeout,
            poolMin: nosqlClient.poolMin,
            poolMax: nosqlClient.poolMax,
          }
        } else {
          // 클라우드 연결 설정
          const ociAuth = configService.getOrThrow<OCIAuthConfig>("oci")
          return {
            endpoint: nosqlConnection.endpoint,
            compartment: nosqlConnection.compartmentId,
            auth: {
              iam: {
                configProvider: {
                  tenancy: ociAuth.tenancy,
                  user: ociAuth.user,
                  fingerprint: ociAuth.fingerprint,
                  privateKey: ociAuth.privateKey,
                  region: ociAuth.region,
                },
              },
            },
            defaults: {
              tableLimits: {
                readUnits: nosqlClient.readUnits,
                writeUnits: nosqlClient.writeUnits,
                storageGB: nosqlClient.storageGB,
              },
            },
            timeout: nosqlClient.timeout,
            poolMin: nosqlClient.poolMin,
            poolMax: nosqlClient.poolMax,
          }
        }
      },
      inject: [ConfigService],
    }),
  ],
  exports: [NoSQLModule],
})
export class NoSQLDatabaseModule {
  static forFeature(repositories: Type<any>[] = []) {
    return NoSQLModule.forFeature(repositories)
  }
}
