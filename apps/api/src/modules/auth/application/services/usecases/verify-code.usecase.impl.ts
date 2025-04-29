import { Injectable } from '@nestjs/common';
import { VerifyCodeUseCase } from '@/modules/auth/application/ports/in/verify-code.usecase';
import { VerifyCodeDto } from '@/modules/auth/application/dtos/verify-code.dto';
import { AuthVerificationRepositoryPort } from '@/modules/auth/application/ports/out/auth-verification-repository.port';
import { VerificationException } from '@/modules/auth/domain/model/auth-exception';

/**
 * 인증 코드 확인 유스케이스 구현체
 */
@Injectable()
export class VerifyCodeUseCaseImpl implements VerifyCodeUseCase {
  constructor(
    private readonly authVerificationRepository: AuthVerificationRepositoryPort
  ) {}

  /**
   * 인증 코드 검증
   * @param dto 인증 코드 검증 정보(인증 ID, 코드)
   * @returns 인증 성공 여부
   */
  async execute(dto: VerifyCodeDto): Promise<boolean> {
    // 인증 객체 조회
    const verification = await this.authVerificationRepository.findById(dto.verificationId);
    
    // 인증 객체가 없는 경우
    if (!verification) {
      throw new VerificationException('유효하지 않은 인증 정보입니다.');
    }
    
    // 이미 인증된 경우
    if (verification.verified) {
      return true;
    }
    
    // 만료된 경우
    if (verification.isExpired) {
      throw new VerificationException('인증 시간이 만료되었습니다. 다시 시도해주세요.');
    }
    
    // 최대 시도 횟수(5회) 초과 검사
    if (verification.attemptCount >= 5) {
      throw new VerificationException('인증 시도 횟수를 초과했습니다. 다시 인증 코드를 요청해주세요.');
    }
    
    // 인증 코드 검증
    const isVerified = verification.verify(dto.code);
    
    // 인증 성공 시 업데이트
    if (isVerified) {
      await this.authVerificationRepository.save(verification);
    }
    
    return isVerified;
  }
}
