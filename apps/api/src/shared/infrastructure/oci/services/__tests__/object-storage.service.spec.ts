import { Test, TestingModule } from "@nestjs/testing"

import { Readable } from "stream"

import { OciClientFactory } from "../../clients/oci-client.factory"
import {
  FileDeleteFailedException,
  FileDownloadFailedException,
  FileNotFoundException,
  FileUploadFailedException,
  PARCreationFailedException,
} from "../../exceptions/oci-storage.exception"
import { ObjectStorageService } from "../object-storage.service"

describe("ObjectStorageService", () => {
  let service: ObjectStorageService
  let ociClientFactory: jest.Mocked<OciClientFactory>

  const mockNamespace = "test-namespace"
  const mockBucketName = "test-bucket"
  const mockObjectName = "users/123/profile.jpg"

  beforeEach(async () => {
    const mockObjectStorageClient = {
      getObject: jest.fn(),
      deleteObject: jest.fn(),
      createPreauthenticatedRequest: jest.fn(),
      deletePreauthenticatedRequest: jest.fn(),
      headObject: jest.fn(),
      region: "ap-seoul-1",
    }

    const mockUploadManager = {
      upload: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObjectStorageService,
        {
          provide: OciClientFactory,
          useValue: {
            getObjectStorageClient: jest.fn().mockReturnValue(mockObjectStorageClient),
            getUploadManager: jest.fn().mockReturnValue(mockUploadManager),
            getNamespace: jest.fn().mockReturnValue(mockNamespace),
            getBucketName: jest.fn().mockReturnValue(mockBucketName),
          },
        },
      ],
    }).compile()

    service = module.get<ObjectStorageService>(ObjectStorageService)
    ociClientFactory = module.get(OciClientFactory)
  })

  describe("upload", () => {
    it("Buffer를 에러 없이 업로드할 수 있어야 한다", async () => {
      // Given
      const buffer = Buffer.from("test image data")
      const uploadOptions = {
        objectName: mockObjectName,
        content: buffer,
        contentType: "image/jpeg",
      }

      const mockUploadManager = ociClientFactory.getUploadManager()
      ;(mockUploadManager.upload as jest.Mock).mockResolvedValue(undefined)

      // When & Then
      await expect(service.upload(uploadOptions)).resolves.toBeUndefined()
    })

    it("Stream을 에러 없이 업로드할 수 있어야 한다", async () => {
      // Given
      const stream = Readable.from("test stream data")
      const uploadOptions = {
        objectName: mockObjectName,
        content: stream,
        contentType: "video/mp4",
        metadata: { uploadedBy: "user123" },
      }

      const mockUploadManager = ociClientFactory.getUploadManager()
      ;(mockUploadManager.upload as jest.Mock).mockResolvedValue(undefined)

      // When & Then
      await expect(service.upload(uploadOptions)).resolves.toBeUndefined()
    })

    it("업로드 실패 시 FileUploadFailedException을 발생시켜야 한다", async () => {
      // Given
      const buffer = Buffer.from("test data")
      const uploadOptions = {
        objectName: mockObjectName,
        content: buffer,
      }

      const mockUploadManager = ociClientFactory.getUploadManager()
      ;(mockUploadManager.upload as jest.Mock).mockRejectedValue({
        statusCode: 500,
        message: "Internal Server Error",
      })

      // When & Then
      await expect(service.upload(uploadOptions)).rejects.toThrow(FileUploadFailedException)
    })
  })

  describe("download", () => {
    it("파일을 다운로드할 수 있어야 한다", async () => {
      // Given
      const mockStream = Readable.from("file content")
      const mockClient = ociClientFactory.getObjectStorageClient()
      ;(mockClient.getObject as jest.Mock).mockResolvedValue({
        value: mockStream,
      })

      // When
      const result = await service.download(mockObjectName)

      // Then
      expect(result).toBe(mockStream)
    })

    it("파일을 찾을 수 없을 때 FileNotFoundException을 발생시켜야 한다", async () => {
      // Given
      const mockClient = ociClientFactory.getObjectStorageClient()
      ;(mockClient.getObject as jest.Mock).mockRejectedValue({
        statusCode: 404,
        message: "Object not found",
      })

      // When & Then
      await expect(service.download(mockObjectName)).rejects.toThrow(FileNotFoundException)
    })

    it("다운로드 실패 시 FileDownloadFailedException을 발생시켜야 한다", async () => {
      // Given
      const mockClient = ociClientFactory.getObjectStorageClient()
      ;(mockClient.getObject as jest.Mock).mockRejectedValue({
        statusCode: 500,
        message: "Internal Server Error",
      })

      // When & Then
      await expect(service.download(mockObjectName)).rejects.toThrow(FileDownloadFailedException)
    })
  })

  describe("delete", () => {
    it("파일을 에러 없이 삭제할 수 있어야 한다", async () => {
      // Given
      const mockClient = ociClientFactory.getObjectStorageClient()
      ;(mockClient.deleteObject as jest.Mock).mockResolvedValue(undefined)

      // When & Then
      await expect(service.delete(mockObjectName)).resolves.toBeUndefined()
    })

    it("삭제 실패 시 FileDeleteFailedException을 발생시켜야 한다", async () => {
      // Given
      const mockClient = ociClientFactory.getObjectStorageClient()
      ;(mockClient.deleteObject as jest.Mock).mockRejectedValue({
        statusCode: 500,
        message: "Internal Server Error",
      })

      // When & Then
      await expect(service.delete(mockObjectName)).rejects.toThrow(FileDeleteFailedException)
    })
  })

  describe("createPAR", () => {
    it("Pre-Authenticated Request를 생성할 수 있어야 한다", async () => {
      // Given
      const parOptions = {
        objectName: mockObjectName,
        parName: "temp-access",
        expiresAt: new Date("2025-12-31"),
        accessType: "ObjectRead" as const,
      }

      const mockClient = ociClientFactory.getObjectStorageClient()
      ;(mockClient.createPreauthenticatedRequest as jest.Mock).mockResolvedValue({
        preauthenticatedRequest: {
          accessUri: "/p/test-access-uri",
        },
      })

      // When
      const result = await service.createPAR(parOptions)

      // Then
      expect(result).toBe("https://objectstorage.ap-seoul-1.oraclecloud.com/p/test-access-uri")
    })

    it("PAR 생성 실패 시 PARCreationFailedException을 발생시켜야 한다", async () => {
      // Given
      const parOptions = {
        objectName: mockObjectName,
        parName: "temp-access",
        expiresAt: new Date("2025-12-31"),
      }

      const mockClient = ociClientFactory.getObjectStorageClient()
      ;(mockClient.createPreauthenticatedRequest as jest.Mock).mockRejectedValue({
        statusCode: 500,
        message: "Internal Server Error",
      })

      // When & Then
      await expect(service.createPAR(parOptions)).rejects.toThrow(PARCreationFailedException)
    })
  })

  describe("getMetadata", () => {
    it("파일 메타데이터를 조회할 수 있어야 한다", async () => {
      // Given
      const mockClient = ociClientFactory.getObjectStorageClient()
      ;(mockClient.headObject as jest.Mock).mockResolvedValue({
        contentLength: "1024",
        contentType: "image/jpeg",
        opcMeta: { uploadedBy: "user123" },
        lastModified: new Date("2025-01-01"),
      })

      // When
      const result = await service.getMetadata(mockObjectName)

      // Then
      expect(result).toEqual({
        contentLength: 1024,
        contentType: "image/jpeg",
        metadata: { uploadedBy: "user123" },
        lastModified: new Date("2025-01-01"),
      })
    })

    it("메타데이터 조회 실패 시 FileNotFoundException을 발생시켜야 한다", async () => {
      // Given
      const mockClient = ociClientFactory.getObjectStorageClient()
      ;(mockClient.headObject as jest.Mock).mockRejectedValue({
        statusCode: 404,
        message: "Object not found",
      })

      // When & Then
      await expect(service.getMetadata(mockObjectName)).rejects.toThrow(FileNotFoundException)
    })
  })

  describe("exists", () => {
    it("파일이 존재하면 true를 반환해야 한다", async () => {
      // Given
      const mockClient = ociClientFactory.getObjectStorageClient()
      ;(mockClient.headObject as jest.Mock).mockResolvedValue({
        contentLength: "1024",
      })

      // When
      const result = await service.exists(mockObjectName)

      // Then
      expect(result).toBe(true)
    })

    it("파일이 존재하지 않으면 false를 반환해야 한다", async () => {
      // Given
      const mockClient = ociClientFactory.getObjectStorageClient()
      ;(mockClient.headObject as jest.Mock).mockRejectedValue({
        statusCode: 404,
        message: "Object not found",
      })

      // When
      const result = await service.exists(mockObjectName)

      // Then
      expect(result).toBe(false)
    })

    it("404 외의 에러는 다시 발생시켜야 한다", async () => {
      // Given
      const mockClient = ociClientFactory.getObjectStorageClient()
      ;(mockClient.headObject as jest.Mock).mockRejectedValue({
        statusCode: 500,
        message: "Internal Server Error",
      })

      // When & Then
      await expect(service.exists(mockObjectName)).rejects.toBeDefined()
    })
  })
})
