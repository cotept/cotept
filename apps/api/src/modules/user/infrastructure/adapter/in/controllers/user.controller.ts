import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from "@nestjs/swagger"
import { ApiStandardErrors, ApiAuthRequiredErrors, ApiUserCrudErrors } from "@/shared/infrastructure/decorators/common-error-responses.decorator"
import { PreventAdminRole } from "@/shared/infrastructure/decorators/prevent-admin-role.decorator"

import { JwtAuthGuard } from "@/modules/auth/infrastructure/common/guards/jwt-auth.guards"
import { UserFacadeService } from "@/modules/user/application/services/facade/user-facade.service"
import { UserRequestMapper } from "@/modules/user/infrastructure/adapter/in/mappers/user-request.mapper"
import {
  ChangePasswordRequestDto,
  CreateUserRequestDto,
  DeleteUserRequestDto,
  UpdateUserRequestDto,
} from "@/modules/user/infrastructure/dtos/request"
import {
  PasswordChangeResponseDto,
  UserDeletionResponseDto,
  UserListResponseDto,
  UserResponseDto,
} from "@/modules/user/infrastructure/dtos/response"
import { ApiOkResponseWrapper } from "@/shared/infrastructure/decorators/api-response.decorator"

@ApiTags("User")
@Controller("users")
export class UserController {
  constructor(
    private readonly userFacadeService: UserFacadeService,
    private readonly requestMapper: UserRequestMapper,
  ) {}

  @Get("userlist")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: "사용자 목록 조회", 
    description: "등록된 모든 사용자 목록을 조회합니다.",
    operationId: "getAllUsers"
  })
  @ApiQuery({ name: "page", required: false, type: Number, description: "페이지 번호 (기본값: 1)" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "페이지당 항목 수 (기본값: 10)" })
  @ApiQuery({ name: "role", required: false, enum: ["MENTEE", "MENTOR", "ADMIN"], description: "역할 필터" })
  @ApiQuery({ name: "status", required: false, enum: ["ACTIVE", "INACTIVE", "SUSPENDED"], description: "상태 필터" })
  @ApiOkResponseWrapper(UserListResponseDto, "성공적으로 사용자 목록을 조회함")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  @ApiForbiddenResponse({ description: "사용자 목록 조회 권한이 없습니다" })
  async getAllUsers(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("role") role?: string,
    @Query("status") status?: string,
  ): Promise<UserListResponseDto> {
    return this.userFacadeService.getAllUsers(page, limit, role, status)
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "사용자 상세 조회", description: "ID로 사용자 정보를 조회합니다." })
  @ApiParam({ name: "id", description: "사용자 ID" })
  @ApiOkResponseWrapper(UserResponseDto, "성공적으로 사용자를 조회함")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  @ApiForbiddenResponse({ description: "해당 사용자 정보에 접근할 권한이 없습니다" })
  @ApiNotFoundResponse({ description: "요청하신 사용자를 찾을 수 없습니다" })
  async getUserById(@Param("id") id: string): Promise<UserResponseDto> {
    return this.userFacadeService.getUserById(id)
  }

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "사용자 생성", description: "새로운 사용자를 생성합니다." })
  @ApiOkResponseWrapper(UserResponseDto, "성공적으로 사용자를 생성함")
  @ApiStandardErrors()
  @ApiUserCrudErrors()
  async createUser(@PreventAdminRole() createUserRequestDto: CreateUserRequestDto): Promise<UserResponseDto> {
    const createUserDto = this.requestMapper.toCreateUserDto(createUserRequestDto)
    return this.userFacadeService.createUser(createUserDto)
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "사용자 정보 수정", description: "사용자 정보를 수정합니다." })
  @ApiParam({ name: "id", description: "사용자 ID" })
  @ApiOkResponseWrapper(UserResponseDto, "성공적으로 사용자 정보를 수정함")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  @ApiUserCrudErrors()
  @ApiForbiddenResponse({ description: "다른 사용자의 정보는 수정할 수 없습니다" })
  async updateUser(
    @Param("id") id: string,
    @Body() updateUserRequestDto: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    const updateUserDto = this.requestMapper.toUpdateUserDto(updateUserRequestDto)
    return this.userFacadeService.updateUser(id, updateUserDto)
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "사용자 삭제", description: "사용자를 삭제합니다." })
  @ApiParam({ name: "id", description: "사용자 ID" })
  @ApiOkResponseWrapper(UserDeletionResponseDto, "성공적으로 사용자를 삭제함")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  @ApiNotFoundResponse({ description: "요청하신 사용자를 찾을 수 없습니다" })
  @ApiForbiddenResponse({ description: "자신의 계정은 삭제할 수 없습니다" })
  async deleteUser(
    @Param("id") id: string,
    @Body() deleteUserRequestDto?: DeleteUserRequestDto,
  ): Promise<UserDeletionResponseDto> {
    const deleteUserDto = deleteUserRequestDto ? this.requestMapper.toDeleteUserDto(deleteUserRequestDto) : undefined
    return this.userFacadeService.deleteUser(id, deleteUserDto)
  }

  @Patch(":id/password")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "비밀번호 변경", description: "사용자 비밀번호를 변경합니다." })
  @ApiParam({ name: "id", description: "사용자 ID" })
  @ApiOkResponseWrapper(PasswordChangeResponseDto, "성공적으로 비밀번호를 변경함")
  @ApiStandardErrors()
  @ApiAuthRequiredErrors()
  @ApiUserCrudErrors()
  @ApiUnauthorizedResponse({ description: "현재 비밀번호가 일치하지 않습니다" })
  @ApiForbiddenResponse({ description: "다른 사용자의 비밀번호는 변경할 수 없습니다" })
  async changePassword(
    @Param("id") id: string,
    @Body() changePasswordRequestDto: ChangePasswordRequestDto,
  ): Promise<PasswordChangeResponseDto> {
    const changePasswordDto = this.requestMapper.toChangePasswordDto(changePasswordRequestDto)
    return this.userFacadeService.changePassword(id, changePasswordDto)
  }
}
