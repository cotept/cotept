import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      // 데이터베이스 연결 테스트
      const isConnected = this.dataSource.isInitialized;
      console.log('Database connection status:', isConnected);
      console.log('DB Config:', this.configService.get('database'));
      
      if (isConnected) {
        // 간단한 쿼리 테스트
        const result = await this.dataSource.query('SELECT 1 FROM DUAL');
        console.log('Query result:', result);
      } else {
        console.error('Database is not connected');
      }
    } catch (error) {
      console.error('Database connection error:', error);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}