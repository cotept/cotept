import { Injectable } from "@nestjs/common"

import { UserDto } from "@/modules/user/application/dto"
import {
  PasswordChangeResponseDto,
  UserDeletionResponseDto,
  UserListResponseDto,
} from "@/modules/user/infrastructure/adapter/in/dto/response"

/**
 * 사용자 응답 매퍼
 * Application DTO → Infrastructure Response DTO 변환
 */
@Injectable()
export class UserResponseMapper {
  toUserResponse(userDto: UserDto): UserDto {
    return {
      idx: userDto.idx,
      userId: userDto.userId,
      email: userDto.email,
      name: userDto.name,
      role: userDto.role,
      status: userDto.status,
      phoneNumber: userDto.phoneNumber,
      phoneVerified: userDto.phoneVerified,
      createdAt: userDto.createdAt,
      updatedAt: userDto.updatedAt,
      lastLoginAt: userDto.lastLoginAt ? userDto.lastLoginAt : undefined,
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
