import { Module, Type } from "@nestjs/common"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"

import { NoSQLDatabaseModule } from "./nosql/nosql-database.module"
import { TypeOrmDatabaseModule } from "./typeorm/typeorm-database.module"

@Module({
  imports: [TypeOrmDatabaseModule, NoSQLDatabaseModule],
  exports: [TypeOrmDatabaseModule, NoSQLDatabaseModule],
})
export class DatabaseModule {
  static forFeature(entities: EntityClassOrSchema[]) {
    return TypeOrmDatabaseModule.forFeature(entities)
  }

  static forNoSQL(repositories: Type<any>[] = []) {
    return NoSQLDatabaseModule.forFeature(repositories)
  }
}
