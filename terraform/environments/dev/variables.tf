# environments/dev/variables.tf
variable "region" {
  description = "OCI 리전"
  type        = string
}

variable "tenancy_ocid" {
  description = "테넌시의 OCID"
  type        = string
  sensitive   = true
}

variable "compartment_id" {
  description = "리소스가 생성될 컴파트먼트의 OCID"
  type        = string
  sensitive   = true
}

variable "project_name" {
  description = "프로젝트 이름"
  type        = string
}

variable "environment" {
  description = "환경 구분자 (dev, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "Environment must be one of: dev, prod."
  }
}

variable "domain_name" {
  description = "서비스 도메인 이름"
  type        = string

  validation {
    condition     = can(regex("^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\\.[a-zA-Z]{2,}$", var.domain_name))
    error_message = "도메인 이름의 형식이 올바르지 않습니다."
  }
}

# IAM 관련 변수
variable "admin_users" {
  description = "관리자 그룹에 추가할 사용자 OCID 목록"
  type        = list(string)
  default     = []
}

# 데이터베이스 관련 변수
variable "db_root_password" {
  description = "PostgreSQL root 사용자의 비밀번호"
  type        = string
  sensitive   = true
}

variable "db_app_password" {
  description = "PostgreSQL 애플리케이션 사용자의 비밀번호"
  type        = string
  sensitive   = true
}

# Redis 관련 변수
variable "redis_password" {
  description = "Redis 서버 비밀번호"
  type        = string
  sensitive   = true
}

# TURN 서버 관련 변수
variable "turn_user" {
  description = "TURN 서버 사용자 이름"
  type        = string
  sensitive   = true
}

variable "turn_password" {
  description = "TURN 서버 비밀번호"
  type        = string
  sensitive   = true
}

variable "turn_realm" {
  description = "TURN 서버 비밀번호"
  type        = string
  sensitive   = true
}

# jwt 관련 변수
variable "jwt_secret" {
  description = "JWT 토큰 서명에 사용될 비밀키"
  type        = string
  sensitive   = true
}

# 추가 태그
variable "additional_tags" {
  description = "모든 리소스에 추가될 태그"
  type        = map(string)
  default     = {}
}
