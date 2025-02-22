# modules/network/loadbalancer/variables.tf

# 기본 인프라 설정
variable "compartment_id" {
  description = "로드밸런서가 생성될 OCI Compartment의 OCID입니다"
  type        = string

  validation {
    condition     = can(regex("^ocid1.compartment.", var.compartment_id))
    error_message = "Compartment ID는 'ocid1.compartment.'로 시작하는 유효한 OCID여야 합니다."
  }
}

variable "subnet_id" {
  description = "로드밸런서가 위치할 퍼블릭 서브넷의 OCID입니다"
  type        = string

  validation {
    condition     = can(regex("^ocid1.subnet.", var.subnet_id))
    error_message = "Subnet ID는 'ocid1.subnet.'로 시작하는 유효한 OCID여야 합니다."
  }
}

variable "project_name" {
  description = "프로젝트의 이름입니다. 리소스 이름의 prefix로 사용됩니다"
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

# 로드밸런서 설정
variable "load_balancer_shape" {
  description = "로드밸런서의 shape입니다. flexible을 사용하여 크기를 유연하게 조정할 수 있습니다"
  type        = string
  default     = "flexible"
}

variable "load_balancer_shape_details" {
  description = "로드밸런서의 최소/최대 대역폭 설정입니다"
  type = object({
    minimum_bandwidth_in_mbps = number
    maximum_bandwidth_in_mbps = number
  })
  default = {
    minimum_bandwidth_in_mbps = 10
    maximum_bandwidth_in_mbps = 100
  }
}

# 백엔드 설정
variable "backend_port" {
  description = "백엔드 서버(API)의 포트 번호입니다"
  type        = number
  default     = 3000
}

variable "health_check_url" {
  description = "백엔드 서버의 상태 확인 URL 경로입니다"
  type        = string
  default     = "/health"
}

# SSL 인증서 설정
variable "ssl_configuration" {
  description = "SSL 인증서 설정입니다. 운영 환경에서는 실제 인증서를 사용해야 합니다"
  type = object({
    certificate_name   = string
    private_key        = string
    public_certificate = string
    ca_certificate     = string
  })
  sensitive = true
}

# 로깅 설정
variable "is_access_logs_enabled" {
  description = "액세스 로그 활성화 여부입니다"
  type        = bool
  default     = true
}

variable "is_error_logs_enabled" {
  description = "에러 로그 활성화 여부입니다"
  type        = bool
  default     = true
}

# 추가 태그
variable "additional_tags" {
  description = "리소스에 추가할 태그들입니다"
  type        = map(string)
  default     = {}
}

variable "api_server_ip" {
  description = "API 서버의 프라이빗 IP 주소입니다"
  type        = string
}
