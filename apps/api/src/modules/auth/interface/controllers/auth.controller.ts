import { Body, Controller, Post } from "@nestjs/common"
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger"
import { LoginResponseDto } from "../dtos/login-response.dto"
import { LoginDto } from "../dtos/login.dto"

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  @Post("login")
  @ApiResponse({
    status: 200,
    description: "로그인 성공",
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "인증 실패 - 잘못된 이메일 또는 비밀번호",
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    // 실제 구현은 나중에 추가
    // 지금은 Swagger 문서화를 위한 더미 응답만 반환
    return {
      success: true,
      accessToken: "dummy_access_token",
      refreshToken: "dummy_refresh_token",
      role: "mentee",
    }
  }

  @Post("refresh")
  @ApiBearerAuth("access-token")
  @ApiResponse({
    status: 200,
    description: "토큰 갱신 성공",
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "인증 실패 - 유효하지 않거나 만료된 토큰",
  })
  async refreshToken(): Promise<LoginResponseDto> {
    // 실제 구현은 나중에 추가
    return {
      success: true,
      accessToken: "new_dummy_access_token",
      refreshToken: "new_dummy_refresh_token",
      role: "mentee",
    }
  }
}
