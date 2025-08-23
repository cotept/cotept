import { Injectable } from "@nestjs/common"

import { UserDto } from "@/modules/user/application/dto/user.dto"
import User from "@/modules/user/domain/model/user"
import {
  PasswordChangeResponseDto,
  UserDeletionResponseDto,
  UserListResponseDto,
} from "@/modules/user/infrastructure/adapter/in/dto/response"
import { BaseMapper } from "@/shared/infrastructure/mappers/base.mapper"
import { DtoMapper } from "@/shared/infrastructure/mappers/dto.mapper"

/**
 * User Domain ↔ DTO 변환 매퍼
 * 애플리케이션 계층에서 사용
 */
@Injectable()
export class UserMapper extends DtoMapper<User, UserDto> {
  /**
   * Domain → DTO 변환
   * 보안상 민감한 필드는 제외하고 API-safe 필드만 포함
   */
  toDto(user: User): UserDto {
    const plainUser = {
      idx: user.idx,
      userId: user.userId,
      email: user.getEmailString(),
      name: user.getNameString(),
      role: user.role,
      status: user.status,
      phoneNumber: user.getPhoneNumberString(),
      phoneVerified: user.isPhoneVerified(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
    }

    return BaseMapper.plainToInstance(UserDto, plainUser)
  }

  /**
   * DTO → Domain 변환
   * DTO는 API-safe 필드만 포함하므로 민감한 필드는 undefined 처리
   */
  toDomain(dto: UserDto): User {
    return new User({
      idx: dto.idx,
      userId: dto.userId,
      email: dto.email,

      // DTO에는 비밀번호 정보가 없으므로 빈 문자열 처리
      passwordHash: "",
      salt: "",

      role: dto.role,
      status: dto.status,
      name: dto.name,
      phoneNumber: dto.phoneNumber,
      phoneVerified: dto.phoneVerified ?? false,

      // 보안 관련 필드는 undefined 처리
      ciHash: undefined,
      diHash: undefined,
      birthDate: undefined,
      gender: undefined,

      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      lastLoginAt: dto.lastLoginAt,
    })
  }

  toUserListResponse(users: UserDto[], totalCount: number, currentPage: number, pageSize: number): UserListResponseDto {
    const totalPages = Math.ceil(totalCount / pageSize)

    return {
      users: users,
      totalCount,
      currentPage,
      pageSize,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrevious: currentPage > 1,
    }
  }

  toPasswordChangeResponse(success: boolean): PasswordChangeResponseDto {
    return {
      success,
      changedAt: new Date().toISOString(),
      message: success ? "비밀번호가 성공적으로 변경되었습니다." : "비밀번호 변경에 실패했습니다.",
    }
  }

  toUserDeletionResponse(deletedUserId: string): UserDeletionResponseDto {
    return {
      success: true,
      deletedUserId,
      deletedAt: new Date().toISOString(),
      message: "사용자가 성공적으로 삭제되었습니다.",
    }
  }
}
