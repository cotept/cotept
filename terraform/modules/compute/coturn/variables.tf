# modules/compute/coturn/variables.tf

# 기본 인프라 설정
variable "compartment_id" {
  description = "Coturn 서버가 생성될 OCI Compartment의 OCID입니다"
  type        = string

  validation {
    condition     = can(regex("^ocid1.compartment.", var.compartment_id))
    error_message = "Compartment ID는 'ocid1.compartment.'로 시작하는 유효한 OCID여야 합니다."
  }
}

variable "subnet_id" {
  description = "Coturn 서버가 위치할 퍼블릭 서브넷의 OCID입니다. WebRTC를 위해 공개 IP가 필요합니다"
  type        = string

  validation {
    condition     = can(regex("^ocid1.subnet.", var.subnet_id))
    error_message = "Subnet ID는 'ocid1.subnet.'로 시작하는 유효한 OCID여야 합니다."
  }
}

variable "project_name" {
  description = "프로젝트의 이름입니다"
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

# Coturn 서버 설정
variable "turn_port_min" {
  description = "Coturn 서버가 사용할 최소 포트 번호입니다"
  type        = number
  default     = 49152 # IANA 권장 동적 포트 범위의 시작

  validation {
    condition     = var.turn_port_min >= 49152 && var.turn_port_min < 65535
    error_message = "최소 포트는 49152에서 65535 사이여야 합니다."
  }
}

variable "turn_port_max" {
  description = "Coturn 서버가 사용할 최대 포트 번호입니다"
  type        = number
  default     = 65535 # IANA 권장 동적 포트 범위의 끝

  validation {
    condition     = var.turn_port_max > 49152 && var.turn_port_max <= 65535
    error_message = "최대 포트는 49152에서 65535 사이여야 합니다."
  }
}

variable "turn_realm" {
  description = "TURN 서버 realm (보통 도메인 이름)"
  type        = string
}

variable "turn_user" {
  description = "Coturn 인증을 위한 사용자 이름입니다"
  type        = string

  validation {
    condition     = length(var.turn_user) >= 4
    error_message = "TURN 사용자 이름은 최소 4자 이상이어야 합니다."
  }
}

variable "turn_password" {
  description = "Coturn 인증을 위한 비밀번호입니다"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.turn_password) >= 8
    error_message = "TURN 비밀번호는 최소 8자 이상이어야 합니다."
  }
}

# 컨테이너 리소스 설정
variable "cpu_count" {
  description = "Coturn 서버에 할당할 CPU 코어 수입니다"
  type        = number
  default     = 1

  validation {
    condition     = var.cpu_count > 0 && var.cpu_count <= 4
    error_message = "CPU 코어 수는 1에서 4 사이여야 합니다."
  }
}

variable "memory_in_gbs" {
  description = "Coturn 서버에 할당할 메모리 크기(GB)입니다"
  type        = number
  default     = 6

  validation {
    condition     = var.memory_in_gbs >= 6 && var.memory_in_gbs <= 24
    error_message = "메모리는 6GB에서 24GB 사이여야 합니다."
  }
}

# Coturn 성능 설정
variable "max_allocate_lifetime" {
  description = "TURN 릴레이 할당의 최대 수명(초)입니다"
  type        = number
  default     = 3600 # 1시간
}

variable "max_bps" {
  description = "클라이언트당 최대 대역폭(bps)입니다"
  type        = number
  default     = 8388608 # 8Mbps
}

# Redis 연동 설정
variable "redis_host" {
  description = "세션 관리를 위한 Redis 서버의 호스트 주소입니다"
  type        = string
}

variable "redis_port" {
  description = "Redis 서버의 포트 번호입니다"
  type        = number
  default     = 6379
}

variable "redis_password" {
  description = "Redis 서버의 인증 비밀번호입니다"
  type        = string
  sensitive   = true
}

# 추가 태그
variable "additional_tags" {
  description = "리소스에 추가할 태그들입니다"
  type        = map(string)
  default     = {}
}

variable "vault_secrets" {
  description = "Vault에서 관리되는 시크릿 정보입니다"
  type = object({
    turn = object({
      id      = string
      version = number
    })
  })
  sensitive = true
}

variable "security_group_id" {
  description = "Coturn 서버에 적용할 보안 그룹의 OCID입니다"
  type        = string
}

variable "turn_max_bps" {
  description = "클라이언트당 최대 대역폭 (bps)"
  type        = number
  default     = 3145728 # 3Mbps
}

variable "turn_total_quota" {
  description = "동시 세션 수 제한"
  type        = number
  default     = 100
}

variable "turn_user_quota" {
  description = "사용자당 세션 수 제한"
  type        = number
  default     = 10
}

variable "turn_tls_certificate_path" {
  description = "TLS 인증서 경로"
  type        = string
}

variable "turn_tls_private_key_path" {
  description = "TLS 개인키 경로"
  type        = string
}
