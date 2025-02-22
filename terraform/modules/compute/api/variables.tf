# modules/compute/api/variables.tf

variable "compartment_id" {
  description = "리소스를 생성할 OCI Compartment의 OCID입니다."
  type        = string

  validation {
    condition     = can(regex("^ocid1.compartment.", var.compartment_id))
    error_message = "Compartment ID must be a valid OCID starting with 'ocid1.compartment.'."
  }
}

variable "subnet_id" {
  description = "API 서버가 위치할 프라이빗 서브넷의 OCID입니다."
  type        = string

  validation {
    condition     = can(regex("^ocid1.subnet.", var.subnet_id))
    error_message = "Subnet ID must be a valid OCID starting with 'ocid1.subnet.'."
  }
}

variable "project_name" {
  description = "프로젝트 이름입니다. 리소스 이름의 prefix로 사용됩니다."
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9]+$", var.project_name))
    error_message = "Project name must contain only lowercase letters and numbers."
  }
}

variable "environment" {
  description = "환경 구분자입니다. (예: dev, staging, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

# Container Instance 리소스 설정
variable "cpu_count" {
  description = "할당할 CPU 코어 수입니다."
  type        = number

  validation {
    condition     = var.cpu_count > 0 && var.cpu_count <= 4
    error_message = "CPU count must be between 1 and 4 for development environment."
  }
}

variable "memory_in_gbs" {
  description = "할당할 메모리 크기(GB)입니다."
  type        = number

  validation {
    condition     = var.memory_in_gbs >= 6 && var.memory_in_gbs <= 24
    error_message = "Memory must be between 6 and 24 GB for development environment."
  }
}

# 태깅 관련 변수
variable "additional_tags" {
  description = "리소스에 추가할 태그들입니다."
  type        = map(string)
  default     = {}
}

variable "vault_secrets" {
  description = "Vault에서 관리되는 시크릿 정보입니다"
  type = object({
    database = object({
      app_password = object({
        id      = string
        version = number
      })
    })
    application = object({
      redis = object({
        id      = string
        version = number
      })
      jwt = object({
        id      = string
        version = number
      })
    })
  })
  sensitive = true
}
