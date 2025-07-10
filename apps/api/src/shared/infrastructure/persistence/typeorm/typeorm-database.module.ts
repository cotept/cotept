import { join } from "node:path"

import { Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"

import { ConfigModule } from "@/configs/config.module"
import { DatabaseConfig } from "@/configs/database/database.config"

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: "default",
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: "oracle",
          ...configService.getOrThrow<DatabaseConfig>("database"),
          poolSize: 25,
          // entities: ALL_ENTITIES,
          entities: [join(__dirname, "**/*.entity{.ts,.js}")],
        }
      },
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class TypeOrmDatabaseModule {
  static forFeature(models: EntityClassOrSchema[]) {
    return TypeOrmModule.forFeature(models)
  }
}
