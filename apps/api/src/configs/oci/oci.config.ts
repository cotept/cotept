import { registerAs } from "@nestjs/config"

import * as fs from "fs"

/**
 * OCI 인증 설정 인터페이스
 */
export interface OCIAuthConfig {
  tenancy: string
  user: string
  fingerprint: string
  privateKey: string
  region: string
}

/**
 * OCI 오브젝트 스토리지 설정 인터페이스
 */
export interface OCIObjectStorageConfig {
  namespace: string
  bucketName: string
}

// OCI 프라이빗 키 로드 (파일 또는 환경변수)
const loadPrivateKey = (): string => {
  if (process.env.OCI_PRIVATE_KEY) {
    return process.env.OCI_PRIVATE_KEY.replace(/\\n/g, "\n")
  } else if (process.env.OCI_PRIVATE_KEY_PATH && fs.existsSync(process.env.OCI_PRIVATE_KEY_PATH)) {
    return fs.readFileSync(process.env.OCI_PRIVATE_KEY_PATH, "utf8")
  } else {
    console.warn("OCI private key not found, using dummy value")
    return "dummy-key" // 개발 환경에서는 더미 값 사용
  }
}

/**
 * OCI 설정
 */
export default registerAs(
  "oci",
  () =>
    ({
      tenancy: process.env.OCI_TENANCY_ID || "",
      user: process.env.OCI_USER_ID || "",
      fingerprint: process.env.OCI_FINGERPRINT || "",
      privateKey: loadPrivateKey(),
      region: process.env.OCI_REGION || "",

      // 기타 OCI 서비스 설정
      objectStorage: {
        namespace: process.env.OCI_OBJECT_STORAGE_NAMESPACE || "",
        bucketName: process.env.OCI_BUCKET_NAME || "",
      } as OCIObjectStorageConfig,
    }) as OCIAuthConfig,
)
