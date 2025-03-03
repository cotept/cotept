import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/shared/infrastructure/persistence/database.module';
import { SessionNoSQLRepository } from './infrastructure/persistence/session.nosql.repository';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    // NoSQL 리포지토리 등록
    DatabaseModule.forNoSQL([
      SessionNoSQLRepository
    ])
  ],
  providers: [
    // 서비스 등록
    // SessionService,
    
    // 리포지토리 제공
    {
      provide: 'SessionRepository',
      useExisting: SessionNoSQLRepository
    }
  ],
  exports: [
    // SessionService,
    'SessionRepository'
  ]
})
export class SessionModule {}
