import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NoSQLClientOptions } from './nosql/client/nosql-client.interface';
import { NoSQLClientProvider, createNoSQLOptionsProvider } from './nosql/client/nosql-client.provider';

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
      imports: [...options.imports],
      providers: [
        {
          provide: 'OCI_NOSQL_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject,
        },
        NoSQLClientProvider,
      ],
      exports: [NoSQLClientProvider],
      global: true,
    };
  }

  /**
   * NoSQL 모듈 루트 설정 (동기)
   */
  static forRoot(options: NoSQLClientOptions): DynamicModule {
    return {
      module: NoSQLModule,
      providers: [
        createNoSQLOptionsProvider(options),
        NoSQLClientProvider,
      ],
      exports: [NoSQLClientProvider],
      global: true,
    };
  }

  /**
   * 특정 기능을 위한 NoSQL 모듈 설정
   * @param repositories 레포지토리 프로바이더 배열
   */
  static forFeature(repositories: any[] = []): DynamicModule {
    return {
      module: NoSQLModule,
      providers: [...repositories],
      exports: [...repositories],
    };
  }
}
