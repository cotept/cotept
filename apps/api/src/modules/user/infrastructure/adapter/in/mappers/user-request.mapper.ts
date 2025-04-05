import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { 
  UserDto, 
  CreateUserDto, 
  UpdateUserDto 
} from '@/modules/user/application/dtos';

/**
 * 인바운드 어댑터 매퍼
 * HTTP 요청에서 받은 데이터를 애플리케이션에서 사용할 DTO로 변환
 */
@Injectable()
export class UserRequestMapper {
  /**
   * 외부 요청 -> 사용자 생성 DTO 변환
   */
  toCreateDto(request: any): CreateUserDto {
    return plainToInstance(CreateUserDto, request, {
      excludeExtraneousValues: true
    });
  }
  
  /**
   * 외부 요청 -> 사용자 업데이트 DTO 변환
   */
  toUpdateDto(request: any): UpdateUserDto {
    return plainToInstance(UpdateUserDto, request, {
      excludeExtraneousValues: true
    });
  }
  
  /**
   * 애플리케이션 DTO -> 응답 객체 변환
   */
  toResponse(dto: UserDto): any {
    // 응답 시에는 모든 속성을 포함하도록 설정 (Swagger API 문서와 일치)
    return plainToInstance(UserDto, dto, {
      excludeExtraneousValues: false
    });
  }
}
