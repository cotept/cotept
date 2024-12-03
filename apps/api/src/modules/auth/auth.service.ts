// src/modules/auth/auth.service.ts
import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { InjectRepository } from "@nestjs/typeorm"
import * as bcrypt from "bcryptjs"
import { Repository } from "typeorm"

import { RedisService } from "@/libs/redis/redis.service"
import { RegistrationProgress } from "@/modules/users/entities/registration-progress.entity"
import { SocialAccount } from "@/modules/users/entities/social-account.entity"
import { User } from "@/modules/users/entities/user.entity"
import { VerificationCode } from "./entities/verification-code.entity"

import { AuthErrorMessage } from "@/common/constants/error.constants"
import { RegisterType } from "./enums/register-type.enum"
import { RegistrationStatus } from "./enums/registration-status.enum"
import { AuthException } from "./exceptions/auth.exception"

import { JwtPayload } from "@/common/interfaces/auth.interface"
import {
  // SocialRegisterDto,
  LoginDto,
  NormalRegisterDto,
} from "./dto/request"
import { AuthResponseDto, RegistrationResponseDto } from "./dto/response"

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RegistrationProgress)
    private readonly registrationProgressRepository: Repository<RegistrationProgress>,
    @InjectRepository(VerificationCode)
    private readonly verificationRepository: Repository<VerificationCode>,
    @InjectRepository(SocialAccount)
    private readonly socialAccountRepository: Repository<SocialAccount>,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 일반 회원가입 1단계: 기본 정보 등록 및 검증
   */
  async startNormalRegistration(
    dto: NormalRegisterDto,
  ): Promise<RegistrationResponseDto> {
    await this.validateUniqueFields({
      email: dto.email,
      bojId: dto.bojId,
      phone: dto.phone,
    })

    const hashedPassword = await bcrypt.hash(dto.password, 12)

    const progress = this.registrationProgressRepository.create({
      registerType: RegisterType.NORMAL,
      email: dto.email,
      bojId: dto.bojId,
      phone: dto.phone,
      password: hashedPassword,
      termsAgreement: {
        serviceTerms: dto.serviceTerms,
        privacyPolicy: dto.privacyPolicy,
        marketingConsent: dto.marketingConsent,
        agreedAt: new Date(),
      },
      status: RegistrationStatus.INFO_SUBMITTED,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24시간
    })

    const savedProgress =
      await this.registrationProgressRepository.save(progress)

    return {
      registrationId: savedProgress.id,
      status: savedProgress.status,
      expiresAt: savedProgress.expiresAt,
      message: "전화번호 인증을 진행해주세요.",
    }
  }

  /**
   * 로그인
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    })

    if (!user || !user.password) {
      throw new AuthException({
        code: "INVALID_CREDENTIALS",
        message: AuthErrorMessage.AUTH.INVALID_CREDENTIALS,
      })
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new AuthException({
        code: "RATE_LIMIT_EXCEEDED",
        message: AuthErrorMessage.AUTH.ACCOUNT_LOCKED,
        details: { lockUntil: user.lockUntil },
      })
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password)
    if (!isPasswordValid) {
      await this.handleLoginFailure(user)
    }

    await this.handleLoginSuccess(user)
    return this.generateAuthResponse(user, dto.deviceId)
  }

  /**
   * 회원가입 완료 및 사용자 생성
   */
  async completeRegistration(registrationId: string): Promise<AuthResponseDto> {
    const progress = await this.registrationProgressRepository.findOne({
      where: { id: registrationId },
    })

    if (!progress) {
      throw new AuthException({
        code: "REGISTRATION_ERROR",
        message: AuthErrorMessage.REGISTRATION.INVALID_PROGRESS_ID,
      })
    }

    if (!progress.isPhoneVerified) {
      throw new AuthException({
        code: "REGISTRATION_ERROR",
        message: AuthErrorMessage.VALIDATION.PHONE.NOT_VERIFIED,
      })
    }

    const user = await this.createUserFromProgress(progress)
    await this.registrationProgressRepository.remove(progress)

    return this.generateAuthResponse(user)
  }

  // private 메서드들
  private async validateUniqueFields({
    email,
    bojId,
    phone,
  }: {
    email: string
    bojId: string
    phone: string
  }) {
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { bojId }, { phone }],
    })

    if (existingUser) {
      if (existingUser.email === email) {
        throw new AuthException({
          code: "VALIDATION_ERROR",
          message: AuthErrorMessage.VALIDATION.EMAIL.DUPLICATE,
        })
      }
      if (existingUser.bojId === bojId) {
        throw new AuthException({
          code: "VALIDATION_ERROR",
          message: AuthErrorMessage.VALIDATION.BOJ_ID.DUPLICATE,
        })
      }
      if (existingUser.phone === phone) {
        throw new AuthException({
          code: "VALIDATION_ERROR",
          message: AuthErrorMessage.VALIDATION.PHONE.DUPLICATE,
        })
      }
    }
  }

  private async handleLoginFailure(user: User) {
    user.loginAttempts += 1

    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 30 * 60 * 1000) // 30분
      user.loginAttempts = 0
    }

    await this.userRepository.save(user)

    throw new AuthException({
      code: "INVALID_CREDENTIALS",
      message: AuthErrorMessage.AUTH.INVALID_CREDENTIALS,
      details: {
        remainingAttempts: 5 - user.loginAttempts,
        lockUntil: user.lockUntil,
      },
    })
  }

  private async handleLoginSuccess(user: User) {
    user.loginAttempts = 0
    user.lockUntil = null
    user.lastLoginAt = new Date()
    await this.userRepository.save(user)
  }

  private async generateAuthResponse(
    user: User,
    deviceId?: string,
  ): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign(payload, { expiresIn: "15m" }),
      this.jwtService.sign({ ...payload, deviceId }, { expiresIn: "7d" }),
    ])

    await this.redisService.setRefreshToken(
      user.id,
      refreshToken,
      deviceId,
      7 * 24 * 60 * 60,
    )

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        bojId: user.bojId,
        currentTier: user.currentTier,
      },
    }
  }
}
