import { Module, DynamicModule, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NoSQLClientOptions } from './client/nosql-client.interface';
import { NoSQLClientProvider, createNoSQLOptionsProvider, OCI_NOSQL_CLIENT } from './client/nosql-client.provider';
import { SessionMapper } from './mappers/session.mapper';

@Module({
  imports: [ConfigModule],
  providers: [
    // 매퍼 클래스들
    SessionMapper,
    // 다른 매퍼들...
  ],
  exports: [
    SessionMapper,
    // 다른 매퍼들...
  ]
})
export class NoSQLMappersModule {}

@Module({})
export class NoSQLModule {
  /**
   * NoSQL 모듈 루트 설정 (비동기)
   */
  static forRootAsync(options: {
    imports: any[];
    useFactory: (...args: any[]) => NoSQLClientOptions;
    inject: any[];
  }): DynamicModule {
    return {
      module: NoSQLModule,
      imports: [...options.imports, NoSQLMappersModule],
      providers: [
        {
          provide: 'OCI_NOSQL_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject,
        },
        NoSQLClientProvider,
      ],
      exports: [NoSQLClientProvider, NoSQLMappersModule],
      global: true,
    };
  }

  /**
   * NoSQL 모듈 루트 설정 (동기)
   */
  static forRoot(options: NoSQLClientOptions): DynamicModule {
    return {
      module: NoSQLModule,
      imports: [NoSQLMappersModule],
      providers: [
        createNoSQLOptionsProvider(options),
        NoSQLClientProvider,
      ],
      exports: [NoSQLClientProvider, NoSQLMappersModule],
      global: true,
    };
  }

  /**
   * 특정 기능을 위한 NoSQL 모듈 설정
   * @param repositories 레포지토리 프로바이더 배열
   */
  static forFeature(repositories: Provider[] = []): DynamicModule {
    return {
      module: NoSQLModule,
      imports: [NoSQLMappersModule],
      providers: [...repositories],
      exports: [...repositories],
    };
  }
}
