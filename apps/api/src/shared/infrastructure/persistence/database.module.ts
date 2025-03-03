import { ConfigModule } from "@/configs/config.module"
import { DatabaseConfig } from "@/configs/database/database.config"
import { Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import { NoSQLModule } from "./nosql/nosql.module"
import { NoSQLConnectionConfig, NoSQLClientConfig } from "@/configs/nosql/nosql.config"
import { OCIAuthConfig } from "@/configs/oci/oci.config"

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        ...configService.getOrThrow<DatabaseConfig>("database"),
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    // NoSQL 모듈 추가
    NoSQLModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // 설정 가져오기
        const nosqlConnection = configService.getOrThrow<NoSQLConnectionConfig>('nosql.connection');
        const nosqlClient = configService.getOrThrow<NoSQLClientConfig>('nosql.client');
        const ociAuth = configService.getOrThrow<OCIAuthConfig>('oci');
        
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
                region: ociAuth.region
              }
            }
          },
          defaults: {
            tableLimits: {
              readUnits: nosqlClient.readUnits,
              writeUnits: nosqlClient.writeUnits,
              storageGB: nosqlClient.storageGB
            }
          },
          timeout: nosqlClient.timeout,
          poolMin: nosqlClient.poolMin,
          poolMax: nosqlClient.poolMax
        };
      },
      inject: [ConfigService]
    })
  ],
  exports: [TypeOrmModule, NoSQLModule],
})
export class DatabaseModule {
  static forFeature(models: EntityClassOrSchema[]) {
    return TypeOrmModule.forFeature(models)
  }
  
  static forNoSQL(repositories: any[] = []) {
    return NoSQLModule.forFeature(repositories);
  }
}
