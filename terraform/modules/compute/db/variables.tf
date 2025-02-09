# modules/compute/db/variables.tf

# 기본 인프라 설정
variable "compartment_id" {
  description = "데이터베이스가 생성될 OCI Compartment의 OCID입니다"
  type        = string
  
  validation {
    condition     = can(regex("^ocid1.compartment.", var.compartment_id))
    error_message = "Compartment ID는 'ocid1.compartment.'로 시작하는 유효한 OCID여야 합니다."
  }
}

variable "subnet_id" {
  description = "데이터베이스가 위치할 프라이빗 서브넷의 OCID입니다"
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
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment는 'dev', 'staging', 'prod' 중 하나여야 합니다."
  }
}

# PostgreSQL 컨테이너 리소스 설정
variable "cpu_count" {
  description = "데이터베이스 서버에 할당할 CPU 코어 수입니다. 일반적인 CRUD 작업과 백그라운드 프로세스를 처리하기 위해 1코어를 사용합니다"
  type        = number
  default     = 1

  validation {
    condition     = var.cpu_count == 1
    error_message = "현재 환경에서는 1 CPU 코어만 사용 가능합니다."
  }
}

variable "memory_in_gbs" {
  description = "데이터베이스 서버에 할당할 메모리 크기(GB)입니다. shared_buffers와 작업 메모리로 사용됩니다"
  type        = number
  default     = 6

  validation {
    condition     = var.memory_in_gbs == 6
    error_message = "현재 환경에서는 6GB 메모리만 사용 가능합니다."
  }
}

# PostgreSQL 성능 설정
variable "max_connections" {
  description = "최대 데이터베이스 연결 수입니다. API 서버의 연결 풀과 관리용 연결을 포함합니다"
  type        = number
  default     = 50  # 20(API 서버) + 10(백그라운드) + 17(예비) + 3(관리자)
}

variable "shared_buffers_mb" {
  description = "PostgreSQL shared_buffers 크기(MB)입니다. 전체 메모리의 25%를 할당합니다"
  type        = number
  default     = 1536  # 6GB의 25%
}

# 데이터베이스 인증 설정
variable "postgres_password" {
  description = "PostgreSQL root 사용자(postgres)의 비밀번호입니다"
  type        = string
  sensitive   = true
  
  validation {
    condition     = length(var.postgres_password) >= 8
    error_message = "비밀번호는 최소 8자 이상이어야 합니다."
  }
}

variable "db_name" {
  description = "생성할 데이터베이스의 이름입니다"
  type        = string
  default     = "cotept"
}

variable "db_user" {
  description = "애플리케이션용 데이터베이스 사용자 이름입니다"
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

# 추가 태그
variable "additional_tags" {
  description = "리소스에 추가할 태그들입니다"
  type        = map(string)
  default     = {}
}