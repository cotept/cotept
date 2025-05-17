import { JwtAuthGuard } from "@/modules/auth/infrastructure/common/guards/jwt-auth.guards"
import { ChangePasswordDto } from "@/modules/user/application/dtos/change-password.dto"
import { CreateUserDto } from "@/modules/user/application/dtos/create-user.dto"
import { DeleteUserDto } from "@/modules/user/application/dtos/delete-user.dto"
import { UpdateUserDto } from "@/modules/user/application/dtos/update-user.dto"
import { UserFacadeService } from "@/modules/user/application/services/facade/user-facade.service"
import {
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
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"

@ApiTags("사용자 관리")
@Controller("users")
export class UserController {
  constructor(private readonly userFacadeService: UserFacadeService) {}

  @Get("userlist")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "사용자 목록 조회", description: "등록된 모든 사용자 목록을 조회합니다." })
  @ApiQuery({ name: "page", required: false, type: Number, description: "페이지 번호 (기본값: 1)" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "페이지당 항목 수 (기본값: 10)" })
  @ApiQuery({ name: "role", required: false, enum: ["MENTEE", "MENTOR", "ADMIN"], description: "역할 필터" })
  @ApiQuery({ name: "status", required: false, enum: ["ACTIVE", "INACTIVE", "SUSPENDED"], description: "상태 필터" })
  @ApiOkResponse({ description: "성공적으로 사용자 목록을 조회함" })
  async getAllUsers(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("role") role?: string,
    @Query("status") status?: string,
  ) {
    return this.userFacadeService.getAllUsers(page, limit, role, status)
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "사용자 상세 조회", description: "ID로 사용자 정보를 조회합니다." })
  @ApiParam({ name: "id", description: "사용자 ID" })
  @ApiOkResponse({ description: "성공적으로 사용자를 조회함" })
  @ApiNotFoundResponse({ description: "사용자를 찾을 수 없음" })
  async getUserById(@Param("id") id: string) {
    return this.userFacadeService.getUserById(id)
  }

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "사용자 생성", description: "새로운 사용자를 생성합니다." })
  @ApiCreatedResponse({ description: "성공적으로 사용자를 생성함" })
  @ApiBadRequestResponse({ description: "잘못된 요청 데이터" })
  @ApiConflictResponse({ description: "이미 사용 중인 이메일" })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userFacadeService.createUser(createUserDto)
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "사용자 정보 수정", description: "사용자 정보를 수정합니다." })
  @ApiParam({ name: "id", description: "사용자 ID" })
  @ApiOkResponse({ description: "성공적으로 사용자 정보를 수정함" })
  @ApiNotFoundResponse({ description: "사용자를 찾을 수 없음" })
  @ApiBadRequestResponse({ description: "잘못된 요청 데이터" })
  async updateUser(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userFacadeService.updateUser(id, updateUserDto)
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "사용자 삭제", description: "사용자를 삭제합니다." })
  @ApiParam({ name: "id", description: "사용자 ID" })
  @ApiNoContentResponse({ description: "성공적으로 사용자를 삭제함" })
  @ApiNotFoundResponse({ description: "사용자를 찾을 수 없음" })
  async deleteUser(@Param("id") id: string, @Body() deleteUserDto?: DeleteUserDto) {
    return this.userFacadeService.deleteUser(id, deleteUserDto)
  }

  @Patch(":id/password")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "비밀번호 변경", description: "사용자 비밀번호를 변경합니다." })
  @ApiParam({ name: "id", description: "사용자 ID" })
  @ApiOkResponse({ description: "성공적으로 비밀번호를 변경함" })
  @ApiNotFoundResponse({ description: "사용자를 찾을 수 없음" })
  @ApiUnauthorizedResponse({ description: "현재 비밀번호가 일치하지 않음" })
  @ApiBadRequestResponse({ description: "비밀번호 정책 위반 또는 확인 불일치" })
  async changePassword(@Param("id") id: string, @Body() changePasswordDto: ChangePasswordDto) {
    return this.userFacadeService.changePassword(id, changePasswordDto)
  }
}
