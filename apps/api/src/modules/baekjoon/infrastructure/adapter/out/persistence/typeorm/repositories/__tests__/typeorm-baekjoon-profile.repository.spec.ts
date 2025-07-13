import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaekjoonProfileRepository } from '../typeorm-baekjoon-profile.repository'
import { BaekjoonProfileEntity } from '../../entities/typeorm-baekjoon-profile.entity'
import { BaekjoonProfileMapper } from '../../mappers/baekjoon.mapper'

import { BaekjoonUser } from '@/modules/baekjoon/domain/model'
import { TierLevel, BaekjoonProfileVerificationStatusType } from '@/modules/baekjoon/domain/vo'

describe('BaekjoonProfileRepository', () => {
  let repository: BaekjoonProfileRepository
  let mockTypeOrmRepository: jest.Mocked<Repository<BaekjoonProfileEntity>>
  let mockMapper: jest.Mocked<BaekjoonProfileMapper>

  const mockUserId = 'user@example.com'
  const mockHandle = 'test_user'

  const mockBaekjoonUser = new BaekjoonUser({
    userId: mockUserId,
    handle: mockHandle,
    currentTier: TierLevel.GOLD_III,
    solvedCount: 150,
    name: 'Test User'
  })

  const mockBaekjoonProfileEntity: Partial<BaekjoonProfileEntity> = {
    userId: mockUserId,
    baekjoonId: mockHandle,
    currentTier: TierLevel.GOLD_III,
    solvedCount: 150,
    name: 'Test User',
    verificationStatus: 'PENDING',
    isMentorEligible: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(async () => {
    mockTypeOrmRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    } as unknown as jest.Mocked<Repository<BaekjoonProfileEntity>>

    mockMapper = {
      toDomainModel: jest.fn(),
      toEntity: jest.fn(),
      updateEntityFromDomain: jest.fn(),
    } as unknown as jest.Mocked<BaekjoonProfileMapper>

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BaekjoonProfileRepository,
        {
          provide: getRepositoryToken(BaekjoonProfileEntity),
          useValue: mockTypeOrmRepository,
        },
        {
          provide: BaekjoonProfileMapper,
          useValue: mockMapper,
        },
      ],
    }).compile()

    repository = module.get<BaekjoonProfileRepository>(BaekjoonProfileRepository)
  })

  describe('save', () => {
    it('도메인 모델을 엔티티로 변환하여 저장하고 결과를 도메인 모델로 반환해야 한다', async () => {
      const savedEntity = { ...mockBaekjoonProfileEntity, id: 'generated-id' }
      const savedDomainUser = new BaekjoonUser({ ...mockBaekjoonUser })

      mockMapper.toEntity.mockReturnValue(mockBaekjoonProfileEntity as BaekjoonProfileEntity)
      mockTypeOrmRepository.save.mockResolvedValue(savedEntity as BaekjoonProfileEntity)
      mockMapper.toDomainModel.mockReturnValue(savedDomainUser)

      const result = await repository.save(mockBaekjoonUser)

      expect(mockMapper.toEntity).toHaveBeenCalledWith(mockBaekjoonUser)
      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(mockBaekjoonProfileEntity)
      expect(mockMapper.toDomainModel).toHaveBeenCalledWith(savedEntity)
      expect(result).toBe(savedDomainUser)
    })
  })

  describe('findByUserId', () => {
    it('사용자 ID로 백준 프로필을 찾아 도메인 모델로 변환해야 한다', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(mockBaekjoonProfileEntity as BaekjoonProfileEntity)
      mockMapper.toDomainModel.mockReturnValue(mockBaekjoonUser)

      const result = await repository.findByUserId(mockUserId)

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { userId: mockUserId }
      })
      expect(mockMapper.toDomainModel).toHaveBeenCalledWith(mockBaekjoonProfileEntity)
      expect(result).toBe(mockBaekjoonUser)
    })

    it('사용자 ID에 해당하는 프로필이 없으면 null을 반환해야 한다', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null)

      const result = await repository.findByUserId('non-existent-user')

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 'non-existent-user' }
      })
      expect(mockMapper.toDomainModel).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })
  })

  describe('findByBaekjoonId', () => {
    it('백준 ID로 프로필을 찾아 도메인 모델로 변환해야 한다', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(mockBaekjoonProfileEntity as BaekjoonProfileEntity)
      mockMapper.toDomainModel.mockReturnValue(mockBaekjoonUser)

      const result = await repository.findByBaekjoonId(mockHandle)

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { baekjoonId: mockHandle }
      })
      expect(mockMapper.toDomainModel).toHaveBeenCalledWith(mockBaekjoonProfileEntity)
      expect(result).toBe(mockBaekjoonUser)
    })

    it('백준 ID에 해당하는 프로필이 없으면 null을 반환해야 한다', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null)

      const result = await repository.findByBaekjoonId('non-existent-handle')

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { baekjoonId: 'non-existent-handle' }
      })
      expect(mockMapper.toDomainModel).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })
  })

  describe('update', () => {
    it('기존 엔티티를 찾아 도메인 모델로 업데이트하고 저장해야 한다', async () => {
      const updatedEntity = { ...mockBaekjoonProfileEntity, solvedCount: 200 }
      const updatedDomainUser = new BaekjoonUser({ ...mockBaekjoonUser, solvedCount: 200 })

      mockTypeOrmRepository.findOne.mockResolvedValue(mockBaekjoonProfileEntity as BaekjoonProfileEntity)
      mockMapper.updateEntityFromDomain.mockReturnValue(updatedEntity as BaekjoonProfileEntity)
      mockTypeOrmRepository.save.mockResolvedValue(updatedEntity as BaekjoonProfileEntity)
      mockMapper.toDomainModel.mockReturnValue(updatedDomainUser)

      const result = await repository.update(mockUserId, updatedDomainUser)

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { userId: mockUserId }
      })
      expect(mockMapper.updateEntityFromDomain).toHaveBeenCalledWith(
        mockBaekjoonProfileEntity,
        updatedDomainUser
      )
      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(updatedEntity)
      expect(mockMapper.toDomainModel).toHaveBeenCalledWith(updatedEntity)
      expect(result).toBe(updatedDomainUser)
    })

    it('기존 엔티티가 없으면 NotFoundException을 던져야 한다', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null)

      await expect(repository.update(mockUserId, mockBaekjoonUser))
        .rejects.toThrow(NotFoundException)

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { userId: mockUserId }
      })
      expect(mockMapper.updateEntityFromDomain).not.toHaveBeenCalled()
      expect(mockTypeOrmRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('exists', () => {
    it('사용자가 존재하면 true를 반환해야 한다', async () => {
      mockTypeOrmRepository.count.mockResolvedValue(1)

      const result = await repository.exists(mockUserId)

      expect(mockTypeOrmRepository.count).toHaveBeenCalledWith({
        where: { userId: mockUserId }
      })
      expect(result).toBe(true)
    })

    it('사용자가 존재하지 않으면 false를 반환해야 한다', async () => {
      mockTypeOrmRepository.count.mockResolvedValue(0)

      const result = await repository.exists('non-existent-user')

      expect(mockTypeOrmRepository.count).toHaveBeenCalledWith({
        where: { userId: 'non-existent-user' }
      })
      expect(result).toBe(false)
    })
  })

  describe('delete', () => {
    it('사용자를 성공적으로 삭제해야 한다', async () => {
      mockTypeOrmRepository.delete.mockResolvedValue({ affected: 1 } as any)

      await repository.delete(mockUserId)

      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith({ userId: mockUserId })
    })

    it('삭제할 사용자가 없으면 NotFoundException을 던져야 한다', async () => {
      mockTypeOrmRepository.delete.mockResolvedValue({ affected: 0 } as any)

      await expect(repository.delete('non-existent-user'))
        .rejects.toThrow(NotFoundException)

      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith({ 
        userId: 'non-existent-user' 
      })
    })
  })

  describe('updateVerificationStatus', () => {
    it('인증 상태를 성공적으로 업데이트해야 한다', async () => {
      const status: BaekjoonProfileVerificationStatusType = 'VERIFIED'
      mockTypeOrmRepository.update.mockResolvedValue({ affected: 1 } as any)

      await repository.updateVerificationStatus(mockUserId, status)

      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith(
        { userId: mockUserId },
        { verificationStatus: status }
      )
    })

    it('업데이트할 사용자가 없으면 NotFoundException을 던져야 한다', async () => {
      const status: BaekjoonProfileVerificationStatusType = 'VERIFIED'
      mockTypeOrmRepository.update.mockResolvedValue({ affected: 0 } as any)

      await expect(repository.updateVerificationStatus('non-existent-user', status))
        .rejects.toThrow(NotFoundException)

      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith(
        { userId: 'non-existent-user' },
        { verificationStatus: status }
      )
    })
  })

  describe('findPendingVerificationUsers', () => {
    it('PENDING 상태의 사용자들을 조회해야 한다', async () => {
      const entities = [mockBaekjoonProfileEntity] as BaekjoonProfileEntity[]
      const domainUsers = [mockBaekjoonUser]

      mockTypeOrmRepository.find.mockResolvedValue(entities)
      mockMapper.toDomainModel.mockReturnValue(mockBaekjoonUser)

      const result = await repository.findPendingVerificationUsers(10)

      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({
        where: { verificationStatus: 'PENDING' },
        take: 10,
        order: { createdAt: 'ASC' }
      })
      expect(mockMapper.toDomainModel).toHaveBeenCalledWith(mockBaekjoonProfileEntity)
      expect(result).toEqual(domainUsers)
    })

    it('기본 제한값으로 조회해야 한다', async () => {
      mockTypeOrmRepository.find.mockResolvedValue([])

      await repository.findPendingVerificationUsers()

      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({
        where: { verificationStatus: 'PENDING' },
        take: 50,
        order: { createdAt: 'ASC' }
      })
    })
  })

  describe('findVerifiedUsers', () => {
    it('VERIFIED 상태의 사용자들을 조회해야 한다', async () => {
      const entities = [mockBaekjoonProfileEntity] as BaekjoonProfileEntity[]
      const domainUsers = [mockBaekjoonUser]

      mockTypeOrmRepository.find.mockResolvedValue(entities)
      mockMapper.toDomainModel.mockReturnValue(mockBaekjoonUser)

      const result = await repository.findVerifiedUsers(20)

      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({
        where: { verificationStatus: 'VERIFIED' },
        take: 20,
        order: { updatedAt: 'DESC' }
      })
      expect(result).toEqual(domainUsers)
    })
  })

  describe('findMentorEligibleUsers', () => {
    it('멘토 자격이 있는 인증된 사용자들을 조회해야 한다', async () => {
      const mentorEligibleEntity = { 
        ...mockBaekjoonProfileEntity, 
        isMentorEligible: true,
        verificationStatus: 'VERIFIED' as const
      }
      const entities = [mentorEligibleEntity] as BaekjoonProfileEntity[]

      mockTypeOrmRepository.find.mockResolvedValue(entities)
      mockMapper.toDomainModel.mockReturnValue(mockBaekjoonUser)

      const result = await repository.findMentorEligibleUsers(30)

      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({
        where: {
          isMentorEligible: true,
          verificationStatus: 'VERIFIED'
        },
        take: 30,
        order: { updatedAt: 'DESC' }
      })
      expect(result).toEqual([mockBaekjoonUser])
    })
  })

  describe('countMentorEligibleUsers', () => {
    it('멘토 자격이 있는 사용자 수를 반환해야 한다', async () => {
      mockTypeOrmRepository.count.mockResolvedValue(15)

      const result = await repository.countMentorEligibleUsers()

      expect(mockTypeOrmRepository.count).toHaveBeenCalledWith({
        where: {
          isMentorEligible: true,
          verificationStatus: 'VERIFIED'
        }
      })
      expect(result).toBe(15)
    })
  })

  describe('에러 처리', () => {
    it('데이터베이스 연결 실패 시 에러를 전파해야 한다', async () => {
      const dbError = new Error('Database connection failed')
      mockTypeOrmRepository.findOne.mockRejectedValue(dbError)

      await expect(repository.findByUserId(mockUserId)).rejects.toThrow(dbError)
    })

    it('매퍼 실패 시 에러를 전파해야 한다', async () => {
      const mapperError = new Error('Mapping failed')
      mockTypeOrmRepository.findOne.mockResolvedValue(mockBaekjoonProfileEntity as BaekjoonProfileEntity)
      mockMapper.toDomainModel.mockImplementation(() => {
        throw mapperError
      })

      await expect(repository.findByUserId(mockUserId)).rejects.toThrow(mapperError)
    })
  })

  describe('데이터 일관성', () => {
    it('도메인 모델과 엔티티 간의 변환이 일관되어야 한다', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(mockBaekjoonProfileEntity as BaekjoonProfileEntity)
      mockMapper.toDomainModel.mockReturnValue(mockBaekjoonUser)
      mockMapper.toEntity.mockReturnValue(mockBaekjoonProfileEntity as BaekjoonProfileEntity)

      const foundUser = await repository.findByUserId(mockUserId)
      expect(foundUser).toBe(mockBaekjoonUser)

      const savedEntity = { ...mockBaekjoonProfileEntity, id: 'new-id' }
      mockTypeOrmRepository.save.mockResolvedValue(savedEntity as BaekjoonProfileEntity)
      
      await repository.save(mockBaekjoonUser)

      expect(mockMapper.toEntity).toHaveBeenCalledWith(mockBaekjoonUser)
      expect(mockMapper.toDomainModel).toHaveBeenCalledWith(savedEntity)
    })
  })
})