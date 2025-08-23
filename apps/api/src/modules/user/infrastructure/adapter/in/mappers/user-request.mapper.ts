import { Injectable } from "@nestjs/common"

import { ChangePasswordDto, CreateUserDto, DeleteUserDto, UpdateUserDto } from "@/modules/user/application/dto"
import { UserRole } from "@/modules/user/domain/model/user"
import {
  ChangePasswordRequestDto,
  CreateUserRequestDto,
  DeleteUserRequestDto,
  UpdateUserRequestDto,
} from "@/modules/user/infrastructure/adapter/in/dto/request"

/**
 * 사용자 요청 매퍼
 * Infrastructure Request DTO → Application DTO 변환
 */
@Injectable()
export class UserRequestMapper {
  toCreateUserDto(request: CreateUserRequestDto): CreateUserDto {
    return {
      userId: request.userId,
      email: request.email,
      password: request.password,
      name: request.name,
      phoneNumber: request.phoneNumber,
      role: request.role || UserRole.MENTEE,
    }
  }

  toUpdateUserDto(request: UpdateUserRequestDto): UpdateUserDto {
    return {
      name: request.name,
      phoneNumber: request.phoneNumber,
    }
  }

  toChangePasswordDto(request: ChangePasswordRequestDto): ChangePasswordDto {
    return {
      currentPassword: request.currentPassword,
      newPassword: request.newPassword,
      confirmPassword: request.confirmPassword,
    }
  }

  toDeleteUserDto(request: DeleteUserRequestDto): DeleteUserDto {
    return {
      userId: request.userId,
      reason: request.reason,
      deleteType: "SOFT",
      deleteRelatedData: false,
    }
  }
}
