# modules/compute/redis/variables.tf

# 기본 인프라 설정
variable "compartment_id" {
  description = "Redis 서버가 생성될 OCI Compartment의 OCID입니다"
  type        = string

  validation {
    condition     = can(regex("^ocid1.compartment.", var.compartment_id))
    error_message = "Compartment ID는 'ocid1.compartment.'로 시작하는 유효한 OCID여야 합니다."
  }
}

variable "subnet_id" {
  description = "Redis 서버가 위치할 프라이빗 서브넷의 OCID입니다. API 서버와 동일한 서브넷을 사용해야 합니다"
  type        = string

  validation {
    condition     = can(regex("^ocid1.subnet.", var.subnet_id))
    error_message = "Subnet ID는 'ocid1.subnet.'로 시작하는 유효한 OCID여야 합니다."
  }
}

# 프로젝트 식별자
variable "project_name" {
  description = "프로젝트의 이름입니다. 리소스 이름의 prefix로 사용됩니다"
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "프로젝트 이름은 소문자, 숫자, 하이픈만 포함할 수 있습니다."
  }
}

variable "environment" {
  description = "환경 구분자입니다 (예: dev, staging, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "Environment는 'dev',  'prod' 중 하나여야 합니다."
  }
}

# Redis 서버 설정
variable "redis_port" {
  description = "Redis 서버가 사용할 포트 번호입니다"
  type        = number
  default     = 6379

  validation {
    condition     = var.redis_port > 1024 && var.redis_port < 65535
    error_message = "Redis 포트는 1024에서 65535 사이의 값이어야 합니다."
  }
}

variable "redis_password" {
  description = "Redis 서버의 인증 비밀번호입니다. 보안을 위해 필수로 설정해야 합니다"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.redis_password) >= 8
    error_message = "Redis 비밀번호는 최소 8자 이상이어야 합니다."
  }
}

variable "maxmemory_mb" {
  description = "Redis가 사용할 최대 메모리 크기(MB)입니다"
  type        = number

  validation {
    condition     = var.maxmemory_mb >= 512
    error_message = "Redis 최대 메모리는 최소 512MB 이상이어야 합니다."
  }
}

variable "maxmemory_policy" {
  description = "메모리 한도 도달 시 적용할 정책입니다"
  type        = string
  default     = "allkeys-lru"

  validation {
    condition     = contains(["noeviction", "allkeys-lru", "volatile-lru", "allkeys-random", "volatile-random", "volatile-ttl"], var.maxmemory_policy)
    error_message = "지원되지 않는 maxmemory-policy입니다."
  }
}

# 컨테이너 리소스 설정
variable "cpu_count" {
  description = "Redis 서버에 할당할 CPU 코어 수입니다"
  type        = number
  default     = 1

  validation {
    condition     = var.cpu_count > 0 && var.cpu_count <= 4
    error_message = "CPU 코어 수는 1에서 4 사이여야 합니다."
  }
}

variable "memory_in_gbs" {
  description = "Redis 서버에 할당할 메모리 크기(GB)입니다"
  type        = number
  default     = 6

  validation {
    condition     = var.memory_in_gbs >= 6 && var.memory_in_gbs <= 24
    error_message = "메모리는 6GB에서 24GB 사이여야 합니다."
  }
}

# 추가 태그 설정
variable "additional_tags" {
  description = "리소스에 추가할 태그들입니다"
  type        = map(string)
  default     = {}
}

variable "vault_secrets" {
  description = "Vault에서 관리되는 시크릿 정보입니다"
  type = object({
    redis = object({
      id          = string
      secret_name = string
      content     = string
    })
  })
  sensitive = true
}
