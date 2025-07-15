import { Injectable } from "@nestjs/common"

import { UserDto } from "@/modules/user/application/dtos"
import {
  PasswordChangeResponseDto,
  UserDeletionResponseDto,
  UserListResponseDto,
  UserResponseDto,
} from "@/modules/user/infrastructure/dtos/response"

/**
 * 사용자 응답 매퍼
 * Application DTO → Infrastructure Response DTO 변환
 */
@Injectable()
export class UserResponseMapper {
  toUserResponse(userDto: UserDto): UserResponseDto {
    return {
      id: userDto.id,
      email: userDto.email,
      name: userDto.name,
      role: userDto.role,
      status: userDto.status,
      phoneNumber: userDto.phoneNumber,
      phoneVerified: userDto.phoneVerified,
      createdAt: userDto.createdAt.toISOString(),
      updatedAt: userDto.updatedAt.toISOString(),
      lastLoginAt: userDto.lastLoginAt?.toISOString(),
    }
  }

  toUserListResponse(users: UserDto[], totalCount: number, currentPage: number, pageSize: number): UserListResponseDto {
    const totalPages = Math.ceil(totalCount / pageSize)

    return {
      users: users.map((user) => this.toUserResponse(user)),
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
