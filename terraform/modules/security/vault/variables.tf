# modules/security/vault/variables.tf

# 기본 인프라 설정
variable "compartment_id" {
  description = "Vault가 생성될 OCI Compartment의 OCID입니다"
  type        = string

  validation {
    condition     = can(regex("^ocid1.compartment.", var.compartment_id))
    error_message = "Compartment ID는 'ocid1.compartment.'로 시작하는 유효한 OCID여야 합니다."
  }
}

variable "project_name" {
  description = "프로젝트의 이름입니다. 모든 리소스 이름의 prefix로 사용됩니다"
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "프로젝트 이름은 소문자, 숫자, 하이픈만 포함할 수 있습니다."
  }
}

variable "environment" {
  description = "환경 구분자입니다 (dev, staging, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "Environment는 'dev',  'prod' 중 하나여야 합니다."
  }
}

# 데이터베이스 관련 시크릿
variable "db_root_password" {
  description = "PostgreSQL root 사용자(postgres)의 비밀번호입니다"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.db_root_password) >= 8
    error_message = "데이터베이스 root 비밀번호는 최소 8자 이상이어야 합니다."
  }
}

variable "db_app_password" {
  description = "PostgreSQL 애플리케이션 사용자의 비밀번호입니다"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.db_app_password) >= 8
    error_message = "데이터베이스 애플리케이션 비밀번호는 최소 8자 이상이어야 합니다."
  }
}

# Redis 관련 시크릿
variable "redis_password" {
  description = "Redis 인증 비밀번호입니다"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.redis_password) >= 8
    error_message = "Redis 비밀번호는 최소 8자 이상이어야 합니다."
  }
}

# API 서버 관련 시크릿
variable "jwt_secret" {
  description = "JWT 토큰 서명에 사용되는 비밀키입니다"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.jwt_secret) >= 32
    error_message = "JWT 비밀키는 최소 32자 이상이어야 합니다."
  }
}

# Coturn 관련 시크릿
variable "turn_user" {
  description = "Coturn 인증에 사용되는 사용자ID 입니다"
  type        = string
  sensitive   = true
}
variable "turn_password" {
  description = "Coturn 인증에 사용되는 비밀번호입니다"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.turn_password) >= 8
    error_message = "Coturn 비밀번호는 최소 8자 이상이어야 합니다."
  }
}
variable "turn_realm" {
  description = "Coturn 인증에 사용되는 도메인입니다"
  type        = string
  sensitive   = true
}

# SSL 인증서 관련 시크릿
# variable "ssl_private_key" {
#   description = "SSL 인증서 개인키"
#   type        = string
#   sensitive   = true
# }

# variable "ssl_certificate" {
#   description = "SSL 공개 인증서"
#   type        = string
#   sensitive   = true
# }

# variable "ssl_ca_certificate" {
#   description = "SSL CA 인증서"
#   type        = string
#   sensitive   = true
# }
