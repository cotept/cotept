import { Injectable } from "@nestjs/common"

import {
  CreateUserProfileRequestDto as ApplicationCreateDto,
  UpdateUserProfileRequestDto as ApplicationUpdateDto,
} from "@/modules/user-profile/application/dtos/user-profile.dto"
import {
  CreateUserProfileRequestDto,
  UpdateUserProfileRequestDto,
} from "@/modules/user-profile/infrastructure/adapter/in/dto/request"

/**
 * Infrastructure → Application 레이어 간 DTO 변환 매퍼
 * HTTP 요청 DTO를 Application 레이어 DTO로 변환합니다.
 */
@Injectable()
export class UserProfileRequestMapper {
  /**
   * Infrastructure CreateUserProfileRequestDto → Application CreateUserProfileRequestDto
   */
  toCreateApplicationDto(infrastructureDto: CreateUserProfileRequestDto): ApplicationCreateDto {
    const applicationDto = new ApplicationCreateDto()
    
    applicationDto.userId = infrastructureDto.userId
    applicationDto.nickname = infrastructureDto.nickname
    applicationDto.fullName = infrastructureDto.fullName
    applicationDto.introduce = infrastructureDto.introduce
    applicationDto.profileImageUrl = infrastructureDto.profileImageUrl

    return applicationDto
  }

  /**
   * Infrastructure UpdateUserProfileRequestDto → Application UpdateUserProfileRequestDto
   */
  toUpdateApplicationDto(infrastructureDto: UpdateUserProfileRequestDto): ApplicationUpdateDto {
    const applicationDto = new ApplicationUpdateDto()
    
    applicationDto.nickname = infrastructureDto.nickname
    applicationDto.fullName = infrastructureDto.fullName
    applicationDto.introduce = infrastructureDto.introduce
    applicationDto.profileImageUrl = infrastructureDto.profileImageUrl

    return applicationDto
  }
}