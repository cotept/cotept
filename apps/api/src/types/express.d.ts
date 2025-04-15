import { TokenPayload } from '@/modules/auth/domain/model/token-payload';

declare global {
  namespace Express {
    // Request 인터페이스에 user 속성 추가
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        [key: string]: any;
      };
      tokenPayload?: TokenPayload;
    }
  }
}

export {};
