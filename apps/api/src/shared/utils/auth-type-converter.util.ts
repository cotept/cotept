/**
 * Auth 모듈 타입 변환 유틸리티
 * JWT 토큰과 도메인 모델 간의 안전한 타입 변환을 제공합니다.
 */

import { BadRequestException, UnauthorizedException } from '@nestjs/common'

/**
 * JWT에서 추출한 string userId를 도메인 모델의 number로 안전하게 변환
 * @param jwtUserId JWT payload의 sub 필드 (string)
 * @param context 에러 발생 시 컨텍스트 정보
 * @returns 변환된 number userId
 * @throws UnauthorizedException 잘못된 토큰 형식인 경우
 */
export function convertJwtUserIdToNumber(jwtUserId: string, context = 'JWT 사용자 ID 변환'): number {
  if (!jwtUserId || typeof jwtUserId !== 'string') {
    throw new UnauthorizedException(`${context}: 유효하지 않은 사용자 ID 형식입니다.`)
  }

  const numericUserId = parseInt(jwtUserId, 10)
  
  if (isNaN(numericUserId) || numericUserId <= 0) {
    throw new UnauthorizedException(`${context}: 사용자 ID가 올바르지 않습니다.`)
  }

  return numericUserId
}

/**
 * 도메인 모델의 number userId를 JWT sub 필드용 string으로 변환
 * @param userId 도메인 모델의 userId (number)
 * @param context 에러 발생 시 컨텍스트 정보
 * @returns JWT sub 필드용 string
 * @throws BadRequestException 잘못된 userId인 경우
 */
export function convertNumberUserIdToJwt(userId: number, context = '사용자 ID JWT 변환'): string {
  if (typeof userId !== 'number' || isNaN(userId) || userId <= 0) {
    throw new BadRequestException(`${context}: 유효하지 않은 사용자 ID입니다.`)
  }

  return userId.toString()
}

/**
 * 도메인 사용자 ID(number)를 string으로 변환 (alias)
 * @param domainUserId 도메인에서 사용하는 number 타입 사용자 ID
 * @param context 변환 컨텍스트 (디버깅용)
 * @returns string 타입 ID
 */
export function convertDomainUserIdToString(domainUserId: number, context = 'Domain 사용자 ID → String 변환'): string {
  return convertNumberUserIdToJwt(domainUserId, context)
}

/**
 * 선택적 JWT userId 변환 (null/undefined 허용)
 * @param jwtUserId JWT payload의 sub 필드 (string | null | undefined)
 * @param context 에러 발생 시 컨텍스트 정보
 * @returns 변환된 number userId 또는 null
 */
export function convertOptionalJwtUserIdToNumber(
  jwtUserId: string | null | undefined, 
  context = '선택적 JWT 사용자 ID 변환'
): number | null {
  if (jwtUserId === null || jwtUserId === undefined) {
    return null
  }
  
  return convertJwtUserIdToNumber(jwtUserId, context)
}

/**
 * 배치 변환: string[] → number[]
 * @param jwtUserIds JWT userId 배열
 * @param context 컨텍스트 정보
 * @returns 변환된 number userId 배열
 */
export function convertJwtUserIdArrayToNumbers(
  jwtUserIds: string[], 
  context = '배치 JWT 사용자 ID 변환'
): number[] {
  return jwtUserIds.map((id, index) => 
    convertJwtUserIdToNumber(id, `${context}[${index}]`)
  )
}

/**
 * 인증 검증 도메인 모델 생성을 위한 타입 변환 헬퍼
 */
export class AuthTypeConverter {
  /**
   * JWT payload에서 도메인 모델 생성에 필요한 타입들을 일괄 변환
   */
  static fromJwtPayload(payload: { sub: string; [key: string]: any }) {
    return {
      userId: convertJwtUserIdToNumber(payload.sub, 'JWT payload 변환'),
      userIdString: payload.sub, // 호환성을 위해 원본 string도 제공
    }
  }

  /**
   * 도메인 모델에서 JWT 생성에 필요한 타입들을 일괄 변환
   */
  static toJwtPayload(userId: number) {
    return {
      sub: convertNumberUserIdToJwt(userId, '도메인 모델 JWT 변환'),
      userId: userId, // 도메인에서 사용하는 number 타입
    }
  }
}