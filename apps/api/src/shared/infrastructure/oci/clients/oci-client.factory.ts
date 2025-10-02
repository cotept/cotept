import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

import { common, objectstorage } from "oci-sdk"

import type { OciConfig, OCIObjectStorageConfig } from "@/configs/oci/oci.config"

/**
 * OCI 클라이언트 팩토리 (Singleton)
 *
 * @description
 * - ConfigService를 통한 환경변수 주입
 * - ObjectStorageClient + UploadManager 싱글톤 관리
 * - SDK 내장 retry 설정 (3회 시도, 5초 대기, 5xx 에러)
 */
@Injectable()
export class OciClientFactory {
  private authProvider: common.SimpleAuthenticationDetailsProvider | null = null
  private objectStorageClient: objectstorage.ObjectStorageClient | null = null
  private uploadManager: objectstorage.UploadManager | null = null

  constructor(private readonly configService: ConfigService) {}

  /**
   * 인증 프로바이더 생성 (Singleton)
   */
  private getAuthProvider(): common.SimpleAuthenticationDetailsProvider {
    if (this.authProvider) {
      return this.authProvider
    }

    const ociConfig = this.configService.get<OciConfig>("oci")

    if (!ociConfig) {
      throw new Error("OCI configuration not found in ConfigService")
    }

    this.authProvider = new common.SimpleAuthenticationDetailsProvider(
      ociConfig.tenancy,
      ociConfig.user,
      ociConfig.fingerprint,
      ociConfig.privateKey,
      null, // passphrase
      common.Region.fromRegionId(ociConfig.region),
    )

    return this.authProvider
  }

  /**
   * ObjectStorageClient 생성 (Singleton)
   *
   * @description
   * - SDK 내장 retry: 3회 시도, 5초 대기, 5xx 에러 자동 재시도
   */
  getObjectStorageClient(): objectstorage.ObjectStorageClient {
    if (this.objectStorageClient) {
      return this.objectStorageClient
    }

    const authProvider = this.getAuthProvider()

    const clientConfiguration: common.ClientConfiguration = {
      retryConfiguration: {
        terminationStrategy: new common.MaxAttemptsTerminationStrategy(3),
        delayStrategy: new common.FixedTimeDelayStrategy(5),
        retryCondition: common.OciSdkDefaultRetryConfiguration.retryCondition,
      },
    }

    this.objectStorageClient = new objectstorage.ObjectStorageClient(
      { authenticationDetailsProvider: authProvider },
      clientConfiguration,
    )

    return this.objectStorageClient
  }

  /**
   * UploadManager 생성 (Singleton)
   *
   * @description
   * - 모든 파일 크기 처리 (이미지 ~ VOD)
   * - 128KB 이상 자동 청크 분할
   * - 스트림 기반 메모리 효율적
   */
  getUploadManager(): objectstorage.UploadManager {
    if (this.uploadManager) {
      return this.uploadManager
    }

    const client = this.getObjectStorageClient()
    this.uploadManager = new objectstorage.UploadManager(client)

    return this.uploadManager
  }

  /**
   * 네임스페이스 조회
   */
  getNamespace(): string {
    const objectStorageConfig = this.configService.get<OCIObjectStorageConfig>("oci.objectStorage")
    return objectStorageConfig?.namespace || ""
  }

  /**
   * 버킷명 조회
   */
  getBucketName(): string {
    const objectStorageConfig = this.configService.get<OCIObjectStorageConfig>("oci.objectStorage")
    return objectStorageConfig?.bucketName || ""
  }
}
