import { Injectable } from "@nestjs/common"

import * as objectstorage from "oci-objectstorage"
import { Readable } from "stream"

import { OciClientFactory } from "../clients/oci-client.factory"
import { mapOciErrorToDomainException } from "../exceptions/oci-storage.exception"

/**
 * 업로드 옵션
 */
export interface UploadOptions {
  /** 객체명 (경로 포함) */
  objectName: string
  /** 파일 스트림 또는 Buffer */
  content: Readable | Buffer
  /** Content-Type (예: image/jpeg, video/mp4) */
  contentType?: string
  /** 커스텀 메타데이터 */
  metadata?: Record<string, string>
}

/**
 * PAR 생성 옵션
 */
export interface CreatePAROptions {
  /** 객체명 */
  objectName: string
  /** PAR 이름 (고유 식별자) */
  parName: string
  /** 만료 시간 (Date 객체) */
  expiresAt: Date
  /** 액세스 타입 (기본: ObjectRead) */
  accessType?: "ObjectRead" | "ObjectWrite" | "ObjectReadWrite"
}

/**
 * OCI Object Storage 서비스
 *
 * @description
 * - UploadManager로 모든 크기 파일 처리 (이미지/VOD 공용)
 * - Pre-Authenticated Request (임시 공개 URL)
 * - 기본 CRUD 작업
 */
@Injectable()
export class ObjectStorageService {
  constructor(private readonly ociClientFactory: OciClientFactory) {}

  /**
   * 파일 업로드 (모든 크기 지원)
   *
   * @description
   * - UploadManager가 자동으로 청크 분할 (128KB 기준)
   * - 프로필 이미지부터 대용량 VOD까지 동일한 방식
   *
   * @example
   * const stream = fs.createReadStream('profile.jpg');
   * await service.upload({
   *   objectName: 'users/123/profile.jpg',
   *   content: stream,
   *   contentType: 'image/jpeg'
   * });
   */
  async upload(options: UploadOptions): Promise<void> {
    try {
      const uploadManager = this.ociClientFactory.getUploadManager()
      const namespace = this.ociClientFactory.getNamespace()
      const bucketName = this.ociClientFactory.getBucketName()

      const content = Buffer.isBuffer(options.content) ? Readable.from(options.content) : options.content

      await uploadManager.upload({
        content: {
          stream: content,
        },
        requestDetails: {
          namespaceName: namespace,
          bucketName,
          objectName: options.objectName,
          contentType: options.contentType,
          opcMeta: options.metadata,
        },
      })
    } catch (error) {
      throw mapOciErrorToDomainException(error, "upload")
    }
  }

  /**
   * 파일 다운로드
   *
   * @returns Readable stream
   */
  async download(objectName: string): Promise<Readable> {
    try {
      const client = this.ociClientFactory.getObjectStorageClient()
      const namespace = this.ociClientFactory.getNamespace()
      const bucketName = this.ociClientFactory.getBucketName()

      const response = await client.getObject({
        namespaceName: namespace,
        bucketName,
        objectName,
      })

      return response.value as unknown as Readable
    } catch (error) {
      throw mapOciErrorToDomainException(error, "download")
    }
  }

  /**
   * 파일 삭제
   */
  async delete(objectName: string): Promise<void> {
    try {
      const client = this.ociClientFactory.getObjectStorageClient()
      const namespace = this.ociClientFactory.getNamespace()
      const bucketName = this.ociClientFactory.getBucketName()

      await client.deleteObject({
        namespaceName: namespace,
        bucketName,
        objectName,
      })
    } catch (error) {
      throw mapOciErrorToDomainException(error, "delete")
    }
  }

  /**
   * Pre-Authenticated Request 생성 (임시 공개 URL)
   *
   * @description
   * - CDN 없이 직접 파일 액세스 가능
   * - 만료 시간 설정 필수
   * - 읽기/쓰기/읽기+쓰기 권한 선택 가능
   *
   * @returns PAR의 전체 URL
   *
   * @example
   * const url = await service.createPAR({
   *   objectName: 'users/123/profile.jpg',
   *   parName: 'profile-temp-access',
   *   expiresAt: new Date(Date.now() + 3600 * 1000), // 1시간 후 만료
   *   accessType: 'ObjectRead'
   * });
   */
  async createPAR(options: CreatePAROptions): Promise<string> {
    try {
      const client = this.ociClientFactory.getObjectStorageClient()
      const namespace = this.ociClientFactory.getNamespace()
      const bucketName = this.ociClientFactory.getBucketName()

      const response = await client.createPreauthenticatedRequest({
        namespaceName: namespace,
        bucketName,
        createPreauthenticatedRequestDetails: {
          name: options.parName,
          objectName: options.objectName,
          accessType:
            objectstorage.models.CreatePreauthenticatedRequestDetails.AccessType[options.accessType || "ObjectRead"],
          timeExpires: options.expiresAt,
        },
      })

      // PAR의 전체 URL 조합
      const region = this.ociClientFactory.getObjectStorageClient().region
      const parPath = response.preauthenticatedRequest.accessUri

      return `https://objectstorage.${region}.oraclecloud.com${parPath}`
    } catch (error) {
      throw mapOciErrorToDomainException(error, "createPAR")
    }
  }

  /**
   * Pre-Authenticated Request 삭제
   *
   * @param parId PAR ID (생성 시 반환된 ID)
   */
  async deletePAR(parId: string): Promise<void> {
    try {
      const client = this.ociClientFactory.getObjectStorageClient()
      const namespace = this.ociClientFactory.getNamespace()
      const bucketName = this.ociClientFactory.getBucketName()

      await client.deletePreauthenticatedRequest({
        namespaceName: namespace,
        bucketName,
        parId,
      })
    } catch (error) {
      throw mapOciErrorToDomainException(error, "deletePAR")
    }
  }

  /**
   * 객체 메타데이터 조회
   *
   * @returns 파일 크기, Content-Type, 커스텀 메타데이터 등
   */
  async getMetadata(objectName: string): Promise<{
    contentLength: number
    contentType: string
    metadata: Record<string, string>
    lastModified: Date
  }> {
    try {
      const client = this.ociClientFactory.getObjectStorageClient()
      const namespace = this.ociClientFactory.getNamespace()
      const bucketName = this.ociClientFactory.getBucketName()

      const response = await client.headObject({
        namespaceName: namespace,
        bucketName,
        objectName,
      })

      return {
        contentLength: parseInt(String(response.contentLength ?? "0"), 10),
        contentType: response.contentType || "application/octet-stream",
        metadata: response.opcMeta || {},
        lastModified: response.lastModified || new Date(),
      }
    } catch (error) {
      throw mapOciErrorToDomainException(error, "getMetadata")
    }
  }

  /**
   * 객체 존재 여부 확인
   */
  async exists(objectName: string): Promise<boolean> {
    try {
      await this.getMetadata(objectName)
      return true
    } catch (error: any) {
      if (error.statusCode === 404) {
        return false
      }
      throw error
    }
  }
}
