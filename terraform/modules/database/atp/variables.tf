# modules/database/atp/variables.tf

variable "create_vault_secrets" {
  description = "OCI Vault에 ATP wallet과 관련된 시크릿을 생성할지 여부"
  type        = bool
  default     = false
}

variable "compartment_id" {
  description = "리소스가 생성될 컴파트먼트의 OCID"
  type        = string
}

variable "project_name" {
  description = "프로젝트 이름"
  type        = string
  default     = "cotept"
}

variable "environment" {
  description = "환경 구분자 (dev, prod)"
  type        = string
  default     = "dev"
}

variable "admin_password" {
  description = "데이터베이스 관리자 비밀번호"
  type        = string
  sensitive   = true
}

variable "wallet_password" {
  description = "지갑 파일 암호화를 위한 비밀번호"
  type        = string
  sensitive   = true
}

variable "vault_id" {
  description = "시크릿을 저장할 OCI Vault의 OCID"
  type        = string
  default     = null
}

variable "vault_key_id" {
  description = "시크릿 암호화에 사용할 키의 OCID"
  type        = string
  default     = null
}

variable "subnet_id" {
  description = "데이터베이스가 배치될 서브넷 ID (프라이빗 엔드포인트 사용 시)"
  type        = string
  default     = null
}

variable "network_security_group_ids" {
  description = "데이터베이스에 할당할 네트워크 보안 그룹 ID 목록"
  type        = list(string)
  default     = []
}

variable "additional_tags" {
  description = "모든 리소스에 추가될 태그"
  type        = map(string)
  default     = {}
}

variable "preferred_connection_service" {
  description = "선호하는 데이터베이스 연결 서비스 유형"
  type        = string
  default     = "medium"
  validation {
    condition     = contains(["high", "medium", "low", "dedicated"], var.preferred_connection_service)
    error_message = "허용되는 연결 서비스 유형: high, medium, low, dedicated."
  }

  # 연결 서비스 유형 설명:
  # - high: 각 SQL 문에 가장 많은 리소스를 제공하여 최고의 성능을 보장하지만, 동시에 실행할 수 있는 SQL 문의 수는 가장 적습니다.
  # - medium: 각 SQL 문에 중간 수준의 리소스를 제공하여 적절한 성능과 동시성의 균형을 제공합니다.
  # - low: 각 SQL 문에 가장 적은 리소스를 제공하지만, 가장 많은 동시 SQL 문을 지원합니다.
  # - dedicated: 각 SQL 문에 가장 적은 수준의 리소스를 제공하지만, 가장 많은 동시 SQL 문을 지원합니다.
}
