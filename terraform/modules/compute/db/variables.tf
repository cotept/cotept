# modules/compute/db/variables.tf

# 기본 인프라 설정
variable "compartment_id" {
  description = "데이터베이스가 생성될 OCI Compartment의 OCID입니다"
  type        = string
}

variable "subnet_id" {
  description = "데이터베이스가 위치할 프라이빗 서브넷의 OCID입니다"
  type        = string
}

variable "project_name" {
  description = "프로젝트의 이름입니다"
  type        = string
}

variable "environment" {
  description = "환경 구분자입니다 (dev, staging, prod)"
  type        = string
}

# PostgreSQL 설정
variable "postgres_port" {
  description = "PostgreSQL이 사용할 포트 번호입니다"
  type        = number
  default     = 5432
}

variable "postgres_password" {
  description = "PostgreSQL root 사용자(postgres)의 비밀번호입니다"
  type        = string
  sensitive   = true
  
  validation {
    condition     = length(var.postgres_password) >= 8
    error_message = "비밀번호는 최소 8자 이상이어야 합니다."
  }
}

# 데이터베이스 초기 설정
variable "db_name" {
  description = "생성할 데이터베이스의 이름입니다"
  type        = string
  default     = "cotept"
}

variable "db_user" {
  description = "데이터베이스 사용자 이름입니다"
  type        = string
  default     = "cotept"
}

variable "db_password" {
  description = "데이터베이스 사용자의 비밀번호입니다"
  type        = string
  sensitive   = true
  
  validation {
    condition     = length(var.db_password) >= 8
    error_message = "비밀번호는 최소 8자 이상이어야 합니다."
  }
}

# Block Volume 설정
variable "data_volume_size_in_gbs" {
  description = "데이터베이스 볼륨의 크기(GB)입니다"
  type        = number
  default     = 50
  
  validation {
    condition     = var.data_volume_size_in_gbs >= 50
    error_message = "볼륨 크기는 최소 50GB 이상이어야 합니다."
  }
}

# 컨테이너 리소스 설정
variable "cpu_count" {
  description = "데이터베이스 서버에 할당할 CPU 코어 수입니다"
  type        = number
  default     = 1
}

variable "memory_in_gbs" {
  description = "데이터베이스 서버에 할당할 메모리 크기(GB)입니다"
  type        = number
  default     = 6
}

# PostgreSQL 성능 튜닝 설정
variable "shared_buffers_mb" {
  description = "PostgreSQL shared_buffers 설정값(MB)입니다"
  type        = number
  default     = 1024  # 기본값은 총 메모리의 25%
}

variable "max_connections" {
  description = "PostgreSQL 최대 동시 연결 수입니다"
  type        = number
  default     = 100
}

# 백업 설정
variable "backup_enabled" {
  description = "자동 백업 활성화 여부입니다"
  type        = bool
  default     = true
}

variable "backup_retention_days" {
  description = "백업 보관 기간(일)입니다"
  type        = number
  default     = 7
}

# 추가 태그
variable "additional_tags" {
  description = "리소스에 추가할 태그들입니다"
  type        = map(string)
  default     = {}
}