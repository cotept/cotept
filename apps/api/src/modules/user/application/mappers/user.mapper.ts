// application/mappers/user.mapper.ts
import { UserDto } from "@/modules/user/application/dtos/user.dto"
import User from "@/modules/user/domain/model/user"
import { Injectable } from "@nestjs/common"
import { plainToInstance } from "class-transformer"

@Injectable()
export class UserMapper {
  /**
   * 도메인 엔티티 -> 애플리케이션 DTO 매핑
   */
  toDto(user: User): UserDto {
    const plainUser = {
      id: user.id,
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

    return plainToInstance(UserDto, plainUser, {
      excludeExtraneousValues: true, // @Expose 데코레이터가 적용된 속성만 포함
    })
  }

  /**
   * 도메인 엔티티 목록 -> DTO 목록 매핑
   */
  toDtoList(users: User[]): UserDto[] {
    return users.map((user) => this.toDto(user))
  }
}
