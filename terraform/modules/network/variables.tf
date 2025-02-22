# modules/network/variables.tf

# 기본 환경 설정 변수들
variable "compartment_id" {
  description = "리소스들이 생성될 OCI Compartment의 OCID입니다"
  type        = string

  validation {
    condition     = can(regex("^ocid1.compartment.", var.compartment_id))
    error_message = "Compartment ID must be a valid OCID starting with 'ocid1.compartment.'."
  }
}

variable "environment" {
  description = "환경 구분자입니다 (예: dev, staging, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "project_name" {
  description = "프로젝트 이름입니다. 모든 리소스의 이름에 prefix로 사용됩니다"
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9]+$", var.project_name))
    error_message = "Project name must contain only lowercase letters and numbers."
  }
}

variable "region" {
  description = "OCI 리전 식별자입니다 (예: ap-chuncheon-1)"
  type        = string

  validation {
    condition     = can(regex("^[a-z]+-[a-z]+-[0-9]+$", var.region))
    error_message = "Region must be in format: region-location-number (e.g., ap-chuncheon-1)."
  }
}

# VCN 관련 변수들
variable "vcn_cidr" {
  description = "VCN의 CIDR 블록입니다. 이는 모든 서브넷을 포함하는 전체 네트워크 주소 공간입니다"
  type        = string
  default     = "10.0.0.0/16" # 약 65,536개의 IP 주소 제공
}

# 서브넷 관련 변수들
# 퍼블릭 서브넷 - 로드밸런서와 Coturn 서버용
variable "public_subnet_cidr" {
  description = "로드밸런서와 Coturn 서버를 위한 퍼블릭 서브넷입니다. 외부 인터넷과 직접 통신이 필요한 서비스들이 위치합니다"
  type        = string
  default     = "10.0.0.0/20" # 약 4,094개의 IP 주소 제공
}

# 프라이빗 애플리케이션 서브넷 - NestJS 서버용
variable "private_app_subnet_cidr" {
  description = "NestJS 애플리케이션 서버를 위한 프라이빗 서브넷입니다. 로드밸런서를 통해서만 외부 요청을 받습니다"
  type        = string
  default     = "10.0.16.0/20" # 약 4,094개의 IP 주소 제공
}

# 프라이빗 데이터베이스 서브넷
variable "private_database_subnet_cidr" {
  description = "데이터베이스를 위한 프라이빗 서브넷입니다. 애플리케이션 서버에서만 접근이 가능합니다"
  type        = string
  default     = "10.0.32.0/20" # 약 4,094개의 IP 주소 제공
}

# 향후 확장을 위한 예비 공간:
# 10.0.48.0/20 - 캐시 레이어 (Redis 등)
# 10.0.64.0/20 - 모니터링 시스템
# 10.0.80.0/20 - 추가 서비스용 예비 공간

# 각 서브넷의 용도와 접근 제어를 명확히 하기 위한 설명 변수
variable "subnet_purposes" {
  description = "각 서브넷의 용도와 접근 제어 정책"
  type        = map(string)
  default = {
    public   = "로드밸런서와 Coturn 서버 (외부 접근 허용)"
    app      = "NestJS 애플리케이션 서버 (로드밸런서를 통한 간접 접근)"
    database = "데이터베이스 서버 (애플리케이션 서버만 접근 가능)"
  }
}

# 라우팅 규칙 관련 변수들
variable "public_route_rules" {
  description = "퍼블릭 서브넷의 라우팅 규칙입니다"
  type = list(object({
    description      = string
    destination      = string
    destination_type = string
  }))
  default = [
    {
      description      = "인터넷으로의 기본 라우팅"
      destination      = "0.0.0.0/0"
      destination_type = "CIDR_BLOCK"
    }
  ]
}

variable "private_route_rules" {
  description = "프라이빗 서브넷의 라우팅 규칙입니다"
  type = list(object({
    description      = string
    destination      = string
    destination_type = string
  }))
  default = [
    {
      description      = "NAT 게이트웨이를 통한 인터넷 접근"
      destination      = "0.0.0.0/0"
      destination_type = "CIDR_BLOCK"
    }
  ]
}

# 보안 관련 변수들
variable "allowed_http_ports" {
  description = "HTTP/HTTPS 트래픽을 위해 허용할 포트 목록입니다"
  type        = list(number)
  default     = [80, 443, 3000, 3001] # 기본 웹 포트와 개발 서버 포트
}

variable "allowed_websocket_ports" {
  description = "WebSocket 연결을 위해 허용할 포트 목록입니다"
  type        = list(number)
  default     = [8080, 8081] # WebSocket 전용 포트
}

variable "allowed_webrtc_ports" {
  description = "WebRTC 미디어 트래픽을 위해 허용할 UDP 포트 범위입니다"
  type = object({
    min = number
    max = number
  })
  default = {
    min = 49152
    max = 65535
  }
}

# DNS 관련 변수들
variable "create_dns_label" {
  description = "VCN과 서브넷에 DNS 레이블을 생성할지 여부입니다"
  type        = bool
  default     = true
}

variable "dns_label_prefix" {
  description = "DNS 레이블의 prefix입니다. environment와 결합하여 사용됩니다"
  type        = string
  default     = "cotept" # 예: cotept-dev
}

# 태깅 관련 변수들
variable "additional_tags" {
  description = "모든 리소스에 추가될 태그들입니다"
  type        = map(string)
  default     = {}
}

# NAT Gateway 관련 변수들
variable "enable_nat_gateway" {
  description = "프라이빗 서브넷을 위한 NAT Gateway를 생성할지 여부입니다"
  type        = bool
  default     = true
}

# Service Gateway 관련 변수들
variable "enable_service_gateway" {
  description = "OCI 서비스 접근을 위한 Service Gateway를 생성할지 여부입니다"
  type        = bool
  default     = true
}
