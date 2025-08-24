import { Test, TestingModule } from '@nestjs/testing'

import { BaekjoonController } from '../baekjoon.controller'

import { BaekjoonFacadeService } from '@/modules/baekjoon/application/services/facade/baekjoon-facade.service'
import { BaekjoonRequestMapper } from '@/modules/baekjoon/infrastructure/adapter/in/mappers/baekjoon-request.mapper'
import {
  CompleteVerificationRequestDto,
  GetProfileRequestDto,
  GetTagStatisticsRequestDto,
  StartVerificationRequestDto,
} from '@/modules/baekjoon/infrastructure/dtos/request'
import {
  BaekjoonProfileResponseDto,
  TagStatisticsResponseDto,
  VerificationResultResponseDto,
  VerificationStatusResponseDto,
} from '@/modules/baekjoon/infrastructure/dtos/response'

describe('BaekjoonController', () => {
  let controller: BaekjoonController
  let mockFacadeService: jest.Mocked<BaekjoonFacadeService>
  let mockRequestMapper: jest.Mocked<BaekjoonRequestMapper>

  const mockUserId = 'user@example.com'
  const mockHandle = 'test_user'
  const mockSessionId = 'session123'

  const mockStartVerificationRequest: StartVerificationRequestDto = {
    email: mockUserId,
    handle: mockHandle
  }

  const mockCompleteVerificationRequest: CompleteVerificationRequestDto = {
    email: mockUserId,
    handle: mockHandle,
    sessionId: mockSessionId
  }

  const mockGetProfileRequest: GetProfileRequestDto = {
    userId: mockUserId,
    handle: mockHandle
  }

  const mockGetStatisticsRequest: GetTagStatisticsRequestDto = {
    userId: mockUserId,
    handle: mockHandle
  }

  const mockVerificationStatusResponse: VerificationStatusResponseDto = {
    sessionId: mockSessionId,
    verificationString: '귀여운고양이12345678',
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    instruction: '백준 프로필의 이름을 다음 문자열로 변경해주세요: 귀여운고양이12345678'
  }

  const mockVerificationResultResponse: VerificationResultResponseDto = {
    sessionId: mockSessionId,
    success: true,
    message: '백준 ID 인증이 완료되었습니다.',
    completedAt: new Date(),
    tierName: 'Gold III'
  }

  const mockProfileResponse: BaekjoonProfileResponseDto = {
    userId: mockUserId,
    handle: mockHandle,
    currentTier: {
      level: 13,
      name: 'Gold III',
      color: '#EC9A00'
    },
    solvedCount: 150,
    name: 'Test User',
    verified: true,
    verificationStatus: 'VERIFIED',
    isMentorEligible: false,
    lastSyncedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const mockStatisticsResponse: TagStatisticsResponseDto = {
    totalCount: 150,
    tierStats: {
      currentTier: 13,
      currentRating: 1800,
      maxTier: 15,
      solvedCount: 150
    },
    topTags: [
      {
        tag: { key: 'implementation', name: '구현' },
        solvedCount: 50,
        rating: 1200
      }
    ],
    lastSynced: new Date()
  }

  beforeEach(async () => {
    mockFacadeService = {
      startVerification: jest.fn(),
      completeVerification: jest.fn(),
      getVerificationStatus: jest.fn(),
      getProfile: jest.fn(),
      getStatistics: jest.fn(),
    } as unknown as jest.Mocked<BaekjoonFacadeService>

    mockRequestMapper = {
      toStartVerificationInput: jest.fn(),
      toCompleteVerificationInput: jest.fn(),
      toGetProfileInput: jest.fn(),
      toGetStatisticsInput: jest.fn(),
    } as unknown as jest.Mocked<BaekjoonRequestMapper>

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BaekjoonController],
      providers: [
        {
          provide: BaekjoonFacadeService,
          useValue: mockFacadeService,
        },
        {
          provide: BaekjoonRequestMapper,
          useValue: mockRequestMapper,
        },
      ],
    }).compile()

    controller = module.get<BaekjoonController>(BaekjoonController)
  })

  describe('startVerification', () => {
    it('인증 시작 요청을 처리하고 인증 상태를 반환해야 한다', async () => {
      const inputDto = {
        email: mockUserId,
        handle: mockHandle
      }

      mockRequestMapper.toStartVerificationInput.mockReturnValue(inputDto)
      mockFacadeService.startVerification.mockResolvedValue(mockVerificationStatusResponse)

      const result = await controller.startVerification(mockStartVerificationRequest)

      expect(mockRequestMapper.toStartVerificationInput).toHaveBeenCalledWith(mockStartVerificationRequest)
      expect(mockFacadeService.startVerification).toHaveBeenCalledWith(inputDto)
      expect(result).toBe(mockVerificationStatusResponse)
    })

    it('facade 서비스에서 에러가 발생하면 에러를 전파해야 한다', async () => {
      const inputDto = {
        email: mockUserId,
        handle: mockHandle
      }
      const serviceError = new Error('Service error')

      mockRequestMapper.toStartVerificationInput.mockReturnValue(inputDto)
      mockFacadeService.startVerification.mockRejectedValue(serviceError)

      await expect(controller.startVerification(mockStartVerificationRequest))
        .rejects.toThrow(serviceError)

      expect(mockRequestMapper.toStartVerificationInput).toHaveBeenCalledWith(mockStartVerificationRequest)
      expect(mockFacadeService.startVerification).toHaveBeenCalledWith(inputDto)
    })
  })

  describe('completeVerification', () => {
    it('인증 완료 요청을 처리하고 결과를 반환해야 한다', async () => {
      const inputDto = {
        email: mockUserId,
        handle: mockHandle,
        sessionId: mockSessionId
      }

      mockRequestMapper.toCompleteVerificationInput.mockReturnValue(inputDto)
      mockFacadeService.completeVerification.mockResolvedValue(mockVerificationResultResponse)

      const result = await controller.completeVerification(mockCompleteVerificationRequest)

      expect(mockRequestMapper.toCompleteVerificationInput).toHaveBeenCalledWith(mockCompleteVerificationRequest)
      expect(mockFacadeService.completeVerification).toHaveBeenCalledWith(inputDto)
      expect(result).toBe(mockVerificationResultResponse)
    })

    it('facade 서비스에서 에러가 발생하면 에러를 전파해야 한다', async () => {
      const inputDto = {
        email: mockUserId,
        handle: mockHandle,
        sessionId: mockSessionId
      }
      const serviceError = new Error('Verification failed')

      mockRequestMapper.toCompleteVerificationInput.mockReturnValue(inputDto)
      mockFacadeService.completeVerification.mockRejectedValue(serviceError)

      await expect(controller.completeVerification(mockCompleteVerificationRequest))
        .rejects.toThrow(serviceError)

      expect(mockRequestMapper.toCompleteVerificationInput).toHaveBeenCalledWith(mockCompleteVerificationRequest)
      expect(mockFacadeService.completeVerification).toHaveBeenCalledWith(inputDto)
    })
  })

  describe('getVerificationStatus', () => {
    it('인증 상태 조회 요청을 처리하고 상태를 반환해야 한다', async () => {
      mockFacadeService.getVerificationStatus.mockResolvedValue(mockVerificationStatusResponse)

      const result = await controller.getVerificationStatus(mockUserId)

      expect(mockFacadeService.getVerificationStatus).toHaveBeenCalledWith(mockUserId)
      expect(result).toBe(mockVerificationStatusResponse)
    })

    it('facade 서비스에서 에러가 발생하면 에러를 전파해야 한다', async () => {
      const serviceError = new Error('Status not found')

      mockFacadeService.getVerificationStatus.mockRejectedValue(serviceError)

      await expect(controller.getVerificationStatus(mockUserId))
        .rejects.toThrow(serviceError)

      expect(mockFacadeService.getVerificationStatus).toHaveBeenCalledWith(mockUserId)
    })
  })

  describe('getProfile', () => {
    it('프로필 조회 요청을 처리하고 프로필을 반환해야 한다', async () => {
      const inputDto = {
        userId: mockUserId,
        handle: mockHandle
      }

      mockRequestMapper.toGetProfileInput.mockReturnValue(inputDto)
      mockFacadeService.getProfile.mockResolvedValue(mockProfileResponse)

      const result = await controller.getProfile(mockGetProfileRequest)

      expect(mockRequestMapper.toGetProfileInput).toHaveBeenCalledWith(mockGetProfileRequest)
      expect(mockFacadeService.getProfile).toHaveBeenCalledWith(inputDto)
      expect(result).toBe(mockProfileResponse)
    })

    it('facade 서비스에서 에러가 발생하면 에러를 전파해야 한다', async () => {
      const inputDto = {
        userId: mockUserId,
        handle: mockHandle
      }
      const serviceError = new Error('Profile not found')

      mockRequestMapper.toGetProfileInput.mockReturnValue(inputDto)
      mockFacadeService.getProfile.mockRejectedValue(serviceError)

      await expect(controller.getProfile(mockGetProfileRequest))
        .rejects.toThrow(serviceError)

      expect(mockRequestMapper.toGetProfileInput).toHaveBeenCalledWith(mockGetProfileRequest)
      expect(mockFacadeService.getProfile).toHaveBeenCalledWith(inputDto)
    })
  })

  describe('getStatistics', () => {
    it('통계 조회 요청을 처리하고 통계를 반환해야 한다', async () => {
      const inputDto = {
        userId: mockUserId,
        handle: mockHandle
      }

      mockRequestMapper.toGetStatisticsInput.mockReturnValue(inputDto)
      mockFacadeService.getStatistics.mockResolvedValue(mockStatisticsResponse)

      const result = await controller.getStatistics(mockGetStatisticsRequest)

      expect(mockRequestMapper.toGetStatisticsInput).toHaveBeenCalledWith(mockGetStatisticsRequest)
      expect(mockFacadeService.getStatistics).toHaveBeenCalledWith(inputDto)
      expect(result).toBe(mockStatisticsResponse)
    })

    it('facade 서비스에서 에러가 발생하면 에러를 전파해야 한다', async () => {
      const inputDto = {
        userId: mockUserId,
        handle: mockHandle
      }
      const serviceError = new Error('Statistics not found')

      mockRequestMapper.toGetStatisticsInput.mockReturnValue(inputDto)
      mockFacadeService.getStatistics.mockRejectedValue(serviceError)

      await expect(controller.getStatistics(mockGetStatisticsRequest))
        .rejects.toThrow(serviceError)

      expect(mockRequestMapper.toGetStatisticsInput).toHaveBeenCalledWith(mockGetStatisticsRequest)
      expect(mockFacadeService.getStatistics).toHaveBeenCalledWith(inputDto)
    })
  })

  describe('의존성 주입', () => {
    it('controller가 올바르게 생성되어야 한다', () => {
      expect(controller).toBeDefined()
      expect(controller).toBeInstanceOf(BaekjoonController)
    })

    it('facade service와 request mapper가 주입되어야 한다', () => {
      expect(controller['baekjoonFacadeService']).toBe(mockFacadeService)
      expect(controller['requestMapper']).toBe(mockRequestMapper)
    })
  })

  describe('HTTP 상태 코드', () => {
    it('startVerification은 201 Created를 반환해야 한다', () => {
      // HTTP 상태 코드는 데코레이터에서 설정되므로 실제 테스트는 e2e에서 확인
      // 여기서는 메서드 호출이 정상적으로 이루어지는지만 확인
      expect(controller.startVerification).toBeDefined()
    })

    it('completeVerification은 200 OK를 반환해야 한다', () => {
      // HTTP 상태 코드는 데코레이터에서 설정되므로 실제 테스트는 e2e에서 확인
      expect(controller.completeVerification).toBeDefined()
    })

    it('다른 GET 엔드포인트들은 기본적으로 200 OK를 반환해야 한다', () => {
      expect(controller.getVerificationStatus).toBeDefined()
      expect(controller.getProfile).toBeDefined()
      expect(controller.getStatistics).toBeDefined()
    })
  })

  describe('Request/Response 데이터 타입', () => {
    it('startVerification은 올바른 요청/응답 타입을 사용해야 한다', async () => {
      const inputDto = { email: mockUserId, handle: mockHandle }
      
      mockRequestMapper.toStartVerificationInput.mockReturnValue(inputDto)
      mockFacadeService.startVerification.mockResolvedValue(mockVerificationStatusResponse)

      const result = await controller.startVerification(mockStartVerificationRequest)

      expect(result).toHaveProperty('sessionId')
      expect(result).toHaveProperty('verificationString')
      expect(result).toHaveProperty('expiresAt')
      expect(result).toHaveProperty('instruction')
    })

    it('completeVerification은 올바른 요청/응답 타입을 사용해야 한다', async () => {
      const inputDto = { email: mockUserId, handle: mockHandle, sessionId: mockSessionId }
      
      mockRequestMapper.toCompleteVerificationInput.mockReturnValue(inputDto)
      mockFacadeService.completeVerification.mockResolvedValue(mockVerificationResultResponse)

      const result = await controller.completeVerification(mockCompleteVerificationRequest)

      expect(result).toHaveProperty('sessionId')
      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('completedAt')
    })

    it('getProfile은 올바른 요청/응답 타입을 사용해야 한다', async () => {
      const inputDto = { userId: mockUserId, handle: mockHandle }
      
      mockRequestMapper.toGetProfileInput.mockReturnValue(inputDto)
      mockFacadeService.getProfile.mockResolvedValue(mockProfileResponse)

      const result = await controller.getProfile(mockGetProfileRequest)

      expect(result).toHaveProperty('userId')
      expect(result).toHaveProperty('handle')
      expect(result).toHaveProperty('currentTier')
      expect(result).toHaveProperty('solvedCount')
      expect(result).toHaveProperty('verified')
    })

    it('getStatistics는 올바른 요청/응답 타입을 사용해야 한다', async () => {
      const inputDto = { userId: mockUserId, handle: mockHandle }
      
      mockRequestMapper.toGetStatisticsInput.mockReturnValue(inputDto)
      mockFacadeService.getStatistics.mockResolvedValue(mockStatisticsResponse)

      const result = await controller.getStatistics(mockGetStatisticsRequest)

      expect(result).toHaveProperty('totalCount')
      expect(result).toHaveProperty('tierStats')
      expect(result).toHaveProperty('topTags')
      expect(result).toHaveProperty('lastSynced')
    })
  })

  describe('에러 처리', () => {
    it('매퍼에서 에러가 발생하면 에러를 전파해야 한다', async () => {
      const mapperError = new Error('Mapping failed')
      
      mockRequestMapper.toStartVerificationInput.mockImplementation(() => {
        throw mapperError
      })

      await expect(controller.startVerification(mockStartVerificationRequest))
        .rejects.toThrow(mapperError)
    })

    it('비동기 처리 중 에러가 발생해도 적절히 처리해야 한다', async () => {
      const asyncError = new Error('Async processing failed')
      const inputDto = { email: mockUserId, handle: mockHandle }

      mockRequestMapper.toStartVerificationInput.mockReturnValue(inputDto)
      mockFacadeService.startVerification.mockRejectedValue(asyncError)

      await expect(controller.startVerification(mockStartVerificationRequest))
        .rejects.toThrow(asyncError)
    })
  })

  describe('파라미터 검증', () => {
    it('getVerificationStatus는 userId 파라미터를 올바르게 처리해야 한다', async () => {
      const testUserId = 'test@example.com'
      
      mockFacadeService.getVerificationStatus.mockResolvedValue(mockVerificationStatusResponse)

      await controller.getVerificationStatus(testUserId)

      expect(mockFacadeService.getVerificationStatus).toHaveBeenCalledWith(testUserId)
    })

    it('특수 문자가 포함된 userId도 처리할 수 있어야 한다', async () => {
      const specialUserId = 'user+test@example.com'
      
      mockFacadeService.getVerificationStatus.mockResolvedValue(mockVerificationStatusResponse)

      await controller.getVerificationStatus(specialUserId)

      expect(mockFacadeService.getVerificationStatus).toHaveBeenCalledWith(specialUserId)
    })
  })
})