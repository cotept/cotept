import { Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  DeleteUserDto,
} from '@/modules/user/application/dtos';
import {
  CreateUserRequestDto,
  UpdateUserRequestDto,
  ChangePasswordRequestDto,
  DeleteUserRequestDto,
} from '@/modules/user/infrastructure/dtos/request';

/**
 * 사용자 요청 매퍼
 * Infrastructure Request DTO → Application DTO 변환
 */
@Injectable()
export class UserRequestMapper {
  toCreateUserDto(request: CreateUserRequestDto): CreateUserDto {
    return {
      email: request.email,
      password: request.password,
      name: request.name,
      phoneNumber: request.phoneNumber,
      role: request.role || 'MENTEE',
    };
  }

  toUpdateUserDto(request: UpdateUserRequestDto): UpdateUserDto {
    return {
      name: request.name,
      phoneNumber: request.phoneNumber,
    };
  }

  toChangePasswordDto(request: ChangePasswordRequestDto): ChangePasswordDto {
    return {
      currentPassword: request.currentPassword,
      newPassword: request.newPassword,
      confirmPassword: request.confirmPassword,
    };
  }

  toDeleteUserDto(request: DeleteUserRequestDto): DeleteUserDto {
    return {
      reason: request.reason,
      deleteType: 'SOFT',
      deleteRelatedData: false,
    };
  }
}
