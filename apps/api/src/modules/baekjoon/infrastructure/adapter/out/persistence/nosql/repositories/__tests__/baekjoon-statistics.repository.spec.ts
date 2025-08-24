import { Test, TestingModule } from '@nestjs/testing'

import { NoSQLClient } from 'oracle-nosqldb'

import { BaekjoonNosqlMapper } from '../../mappers/baekjoon.mapper'
import { BaekjoonTagDocument, BojTag } from '../../schemas/baekjoon.schema'
import { BaekjoonStatisticsRepository } from '../baekjoon-statistics.repository'

import { OCI_NOSQL_CLIENT } from '@/shared/infrastructure/persistence/nosql/client/nosql-client.provider'

describe('BaekjoonStatisticsRepository', () => {
  let repository: BaekjoonStatisticsRepository
  let mockNoSQLClient: jest.Mocked<NoSQLClient>
  let mockMapper: jest.Mocked<BaekjoonNosqlMapper>

  const mockUserId = 'user@example.com'
  const mockHandle = 'test_user'

  const mockBojTags: BojTag[] = [
    {
      tag: {
        key: 'implementation',
        displayNames: [{ name: '구현' }]
      },
      solvedCount: 50,
      rating: 1200
    },
    {
      tag: {
        key: 'math',
        displayNames: [{ name: '수학' }]
      },
      solvedCount: 30,
      rating: 1100
    }
  ]

  const mockTagDocument: BaekjoonTagDocument = {
    userId: mockUserId,
    type: 'baekjoon_tags',
    timestamp: new Date(),
    data: {
      userId: mockUserId,
      handle: mockHandle,
      tags: mockBojTags,
      lastUpdated: new Date()
    }
  }

  const mockQueryResult = {
    rows: [mockTagDocument]
  }

  beforeEach(async () => {
    mockNoSQLClient = {
      prepare: jest.fn(),
      delete: jest.fn(),
      put: jest.fn(),
      get: jest.fn(),
      query: jest.fn(),
    } as unknown as jest.Mocked<NoSQLClient>

    mockMapper = {
      fromApiResponse: jest.fn(),
      toDomain: jest.fn(),
    } as unknown as jest.Mocked<BaekjoonNosqlMapper>

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BaekjoonStatisticsRepository,
        {
          provide: OCI_NOSQL_CLIENT,
          useValue: mockNoSQLClient,
        },
        {
          provide: BaekjoonNosqlMapper,
          useValue: mockMapper,
        },
      ],
    }).compile()

    repository = module.get<BaekjoonStatisticsRepository>(BaekjoonStatisticsRepository)
  })

  describe('saveTagStatistics', () => {
    it('태그 통계를 성공적으로 저장해야 한다', async () => {
      mockMapper.fromApiResponse.mockReturnValue(mockTagDocument)
      
      // BaseNoSQLRepository의 create 메서드를 모킹
      jest.spyOn(repository as any, 'create').mockResolvedValue(undefined)

      await repository.saveTagStatistics(mockUserId, mockHandle, mockBojTags)

      expect(mockMapper.fromApiResponse).toHaveBeenCalledWith(mockUserId, mockHandle, mockBojTags)
      expect(repository['create']).toHaveBeenCalledWith(mockTagDocument)
    })

    it('저장 실패 시 에러를 적절히 처리해야 한다', async () => {
      const saveError = new Error('Save failed')
      mockMapper.fromApiResponse.mockReturnValue(mockTagDocument)
      jest.spyOn(repository as any, 'create').mockRejectedValue(saveError)
      jest.spyOn(repository as any, 'handleDBError').mockImplementation(() => {
        throw saveError
      })

      await expect(repository.saveTagStatistics(mockUserId, mockHandle, mockBojTags))
        .rejects.toThrow(saveError)

      expect(repository['handleDBError']).toHaveBeenCalledWith(saveError)
    })
  })

  describe('findTagStatisticsByHandle', () => {
    it('핸들로 태그 통계를 조회해야 한다', async () => {
      const mockPreparedStatement = {
        bindings: {}
      }

      mockNoSQLClient.prepare.mockResolvedValue(mockPreparedStatement as any)
      jest.spyOn(repository as any, 'query').mockResolvedValue(mockQueryResult)
      mockMapper.toDomain.mockReturnValue(mockBojTags)

      const result = await repository.findTagStatisticsByHandle(mockHandle)

      expect(mockNoSQLClient.prepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM user_activities')
      )
      expect(mockPreparedStatement.bindings).toEqual({
        $type: 'baekjoon_tags',
        $handle: mockHandle
      })
      expect(repository['query']).toHaveBeenCalledWith(mockPreparedStatement)
      expect(mockMapper.toDomain).toHaveBeenCalledWith(mockTagDocument)
      expect(result).toBe(mockBojTags)
    })

    it('데이터가 없으면 null을 반환해야 한다', async () => {
      const mockPreparedStatement = { bindings: {} }
      const emptyResult = { rows: [] }

      mockNoSQLClient.prepare.mockResolvedValue(mockPreparedStatement as any)
      jest.spyOn(repository as any, 'query').mockResolvedValue(emptyResult)

      const result = await repository.findTagStatisticsByHandle(mockHandle)

      expect(result).toBeNull()
      expect(mockMapper.toDomain).not.toHaveBeenCalled()
    })

    it('조회 실패 시 에러를 적절히 처리해야 한다', async () => {
      const queryError = new Error('Query failed')
      mockNoSQLClient.prepare.mockRejectedValue(queryError)
      jest.spyOn(repository as any, 'handleDBError').mockImplementation(() => {
        throw queryError
      })

      await expect(repository.findTagStatisticsByHandle(mockHandle))
        .rejects.toThrow(queryError)

      expect(repository['handleDBError']).toHaveBeenCalledWith(queryError)
    })
  })

  describe('findTagStatisticsByUserId', () => {
    it('사용자 ID로 태그 통계를 조회해야 한다', async () => {
      const mockPreparedStatement = {
        bindings: {}
      }

      mockNoSQLClient.prepare.mockResolvedValue(mockPreparedStatement as any)
      jest.spyOn(repository as any, 'query').mockResolvedValue(mockQueryResult)
      mockMapper.toDomain.mockReturnValue(mockBojTags)

      const result = await repository.findTagStatisticsByUserId(mockUserId)

      expect(mockNoSQLClient.prepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM user_activities')
      )
      expect(mockPreparedStatement.bindings).toEqual({
        $type: 'baekjoon_tags',
        $userId: mockUserId
      })
      expect(repository['query']).toHaveBeenCalledWith(mockPreparedStatement)
      expect(mockMapper.toDomain).toHaveBeenCalledWith(mockTagDocument)
      expect(result).toBe(mockBojTags)
    })

    it('데이터가 없으면 null을 반환해야 한다', async () => {
      const mockPreparedStatement = { bindings: {} }
      const emptyResult = { rows: null }

      mockNoSQLClient.prepare.mockResolvedValue(mockPreparedStatement as any)
      jest.spyOn(repository as any, 'query').mockResolvedValue(emptyResult)

      const result = await repository.findTagStatisticsByUserId(mockUserId)

      expect(result).toBeNull()
      expect(mockMapper.toDomain).not.toHaveBeenCalled()
    })
  })

  describe('updateTagStatistics', () => {
    it('태그 통계를 업데이트해야 한다', async () => {
      mockMapper.fromApiResponse.mockReturnValue(mockTagDocument)
      jest.spyOn(repository as any, 'create').mockResolvedValue(undefined)

      await repository.updateTagStatistics(mockUserId, mockHandle, mockBojTags)

      expect(mockMapper.fromApiResponse).toHaveBeenCalledWith(mockUserId, mockHandle, mockBojTags)
      expect(repository['create']).toHaveBeenCalledWith(mockTagDocument)
    })

    it('업데이트 실패 시 에러를 적절히 처리해야 한다', async () => {
      const updateError = new Error('Update failed')
      mockMapper.fromApiResponse.mockReturnValue(mockTagDocument)
      jest.spyOn(repository as any, 'create').mockRejectedValue(updateError)
      jest.spyOn(repository as any, 'handleDBError').mockImplementation(() => {
        throw updateError
      })

      await expect(repository.updateTagStatistics(mockUserId, mockHandle, mockBojTags))
        .rejects.toThrow(updateError)

      expect(repository['handleDBError']).toHaveBeenCalledWith(updateError)
    })
  })

  describe('deleteTagStatistics', () => {
    it('사용자별 태그 통계를 삭제해야 한다', async () => {
      const mockPreparedStatement = {
        bindings: {}
      }

      mockNoSQLClient.prepare.mockResolvedValue(mockPreparedStatement as any)
      jest.spyOn(repository as any, 'query').mockResolvedValue({})

      await repository.deleteTagStatistics(mockUserId, mockHandle)

      expect(mockNoSQLClient.prepare).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM user_activities')
      )
      expect(mockPreparedStatement.bindings).toEqual({
        $userId: mockUserId,
        $type: 'baekjoon_tags',
        $handle: mockHandle
      })
      expect(repository['query']).toHaveBeenCalledWith(mockPreparedStatement)
    })

    it('삭제 실패 시 에러를 적절히 처리해야 한다', async () => {
      const deleteError = new Error('Delete failed')
      mockNoSQLClient.prepare.mockRejectedValue(deleteError)
      jest.spyOn(repository as any, 'handleDBError').mockImplementation(() => {
        throw deleteError
      })

      await expect(repository.deleteTagStatistics(mockUserId, mockHandle))
        .rejects.toThrow(deleteError)

      expect(repository['handleDBError']).toHaveBeenCalledWith(deleteError)
    })
  })

  describe('deleteByHandle', () => {
    it('핸들별 태그 데이터를 삭제해야 한다', async () => {
      const mockPreparedStatement = {
        bindings: {}
      }

      mockNoSQLClient.prepare.mockResolvedValue(mockPreparedStatement as any)
      jest.spyOn(repository as any, 'query').mockResolvedValue({})

      await repository.deleteByHandle(mockHandle)

      expect(mockNoSQLClient.prepare).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM user_activities')
      )
      expect(mockPreparedStatement.bindings).toEqual({
        $type: 'baekjoon_tags',
        $handle: mockHandle
      })
      expect(repository['query']).toHaveBeenCalledWith(mockPreparedStatement)
    })
  })

  describe('포트 인터페이스 구현', () => {
    it('saveTagStatistics는 saveApiResponse를 호출해야 한다', async () => {
      jest.spyOn(repository, 'saveApiResponse').mockResolvedValue(undefined)

      await repository.saveTagStatistics(mockUserId, mockHandle, mockBojTags)

      expect(repository.saveApiResponse).toHaveBeenCalledWith({
        userId: mockUserId,
        handle: mockHandle,
        apiResponse: mockBojTags
      })
    })

    it('findTagStatisticsByUserId는 findByUserId를 호출해야 한다', async () => {
      jest.spyOn(repository, 'findByUserId').mockResolvedValue(mockBojTags)

      const result = await repository.findTagStatisticsByUserId(mockUserId)

      expect(repository.findByUserId).toHaveBeenCalledWith(mockUserId)
      expect(result).toBe(mockBojTags)
    })

    it('findTagStatisticsByHandle는 findByHandle을 호출해야 한다', async () => {
      jest.spyOn(repository, 'findByHandle').mockResolvedValue(mockBojTags)

      const result = await repository.findTagStatisticsByHandle(mockHandle)

      expect(repository.findByHandle).toHaveBeenCalledWith(mockHandle)
      expect(result).toBe(mockBojTags)
    })

    it('updateTagStatistics는 updateTagData를 호출해야 한다', async () => {
      jest.spyOn(repository, 'updateTagData').mockResolvedValue(undefined)

      await repository.updateTagStatistics(mockUserId, mockHandle, mockBojTags)

      expect(repository.updateTagData).toHaveBeenCalledWith({
        userId: mockUserId,
        handle: mockHandle,
        apiResponse: mockBojTags
      })
    })

    it('deleteTagStatistics는 deleteByUserId를 호출해야 한다', async () => {
      jest.spyOn(repository, 'deleteByUserId').mockResolvedValue(undefined)

      await repository.deleteTagStatistics(mockUserId, mockHandle)

      expect(repository.deleteByUserId).toHaveBeenCalledWith(mockUserId, mockHandle)
    })
  })

  describe('로깅 동작', () => {
    it('성공적인 조회 시 디버그 로그를 남겨야 한다', async () => {
      const mockPreparedStatement = { bindings: {} }
      mockNoSQLClient.prepare.mockResolvedValue(mockPreparedStatement as any)
      jest.spyOn(repository as any, 'query').mockResolvedValue(mockQueryResult)
      mockMapper.toDomain.mockReturnValue(mockBojTags)

      const logSpy = jest.spyOn(repository['logger'], 'debug').mockImplementation()

      await repository.findTagStatisticsByHandle(mockHandle)

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining(`태그 데이터 조회 시작: handle=${mockHandle}`)
      )
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining(`태그 데이터 조회 완료: handle=${mockHandle}`)
      )

      logSpy.mockRestore()
    })

    it('에러 발생 시 에러 로그를 남겨야 한다', async () => {
      const queryError = new Error('Query failed')
      mockNoSQLClient.prepare.mockRejectedValue(queryError)

      const logSpy = jest.spyOn(repository['logger'], 'error').mockImplementation()
      jest.spyOn(repository as any, 'handleDBError').mockImplementation(() => {
        throw queryError
      })

      await expect(repository.findTagStatisticsByHandle(mockHandle))
        .rejects.toThrow(queryError)

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining(`태그 데이터 조회 실패: handle=${mockHandle}`),
        queryError
      )

      logSpy.mockRestore()
    })
  })

  describe('특수 케이스', () => {
    it('빈 태그 배열을 저장할 수 있어야 한다', async () => {
      const emptyTags: BojTag[] = []
      const emptyDocument = { ...mockTagDocument, data: { ...mockTagDocument.data, tags: emptyTags } }
      
      mockMapper.fromApiResponse.mockReturnValue(emptyDocument)
      jest.spyOn(repository as any, 'create').mockResolvedValue(undefined)

      await repository.saveTagStatistics(mockUserId, mockHandle, emptyTags)

      expect(mockMapper.fromApiResponse).toHaveBeenCalledWith(mockUserId, mockHandle, emptyTags)
    })

    it('매우 긴 핸들명을 처리할 수 있어야 한다', async () => {
      const longHandle = 'a'.repeat(100)
      const mockPreparedStatement = { bindings: {} }

      mockNoSQLClient.prepare.mockResolvedValue(mockPreparedStatement as any)
      jest.spyOn(repository as any, 'query').mockResolvedValue({ rows: [] })

      const result = await repository.findTagStatisticsByHandle(longHandle)

      expect(mockPreparedStatement.bindings).toEqual({
        $type: 'baekjoon_tags',
        $handle: longHandle
      })
      expect(result).toBeNull()
    })
  })
})