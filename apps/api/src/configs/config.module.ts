import { Global, Module } from "@nestjs/common"
import { ConfigModule as NestConfigModule } from "@nestjs/config"
import { configuration } from "./configuration"
import { validationSchema } from "./validation.schema"

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", `.env.${process.env.NODE_ENV}`],
      validationSchema: validationSchema,
      load: [configuration],
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}

console.log("current path", __dirname)
