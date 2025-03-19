import { Module } from '@nestjs/common';
import { AuthController } from './interface/controllers/auth.controller';

@Module({
  controllers: [AuthController],
  providers: [],
})
export class AuthModule {}
