# modules/logging/variables.tf

variable "compartment_id" {
  description = "로그가 생성될 OCI Compartment의 OCID입니다"
  type        = string

  validation {
    condition     = can(regex("^ocid1.compartment.", var.compartment_id))
    error_message = "Compartment ID는 'ocid1.compartment.'로 시작하는 유효한 OCID여야 합니다."
  }
}

variable "project_name" {
  description = "프로젝트의 이름입니다. 로그 그룹과 로그 스트림의 이름에 prefix로 사용됩니다"
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "프로젝트 이름은 소문자, 숫자, 하이픈만 포함할 수 있습니다."
  }
}

variable "environment" {
  description = "환경 구분자입니다 (예: dev, staging, prod). 로그 레벨과 보존 기간을 결정하는 데 사용됩니다"
  type        = string

  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "environment는 'dev',  'prod' 중 하나여야 합니다."
  }
}

variable "service_name" {
  description = "로그를 생성하는 서비스의 이름입니다 (예: api, redis, database)"
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.service_name))
    error_message = "서비스 이름은 소문자, 숫자, 하이픈만 포함할 수 있습니다."
  }
}

variable "container_instance_id" {
  description = "로그를 수집할 Container Instance의 OCID입니다"
  type        = string

  validation {
    condition     = can(regex("^ocid1.", var.container_instance_id))
    error_message = "Container Instance ID는 'ocid1.'로 시작하는 유효한 OCID여야 합니다."
  }
}

variable "log_category" {
  description = "로그의 카테고리입니다 (stdout 또는 stderr)"
  type        = string

  validation {
    condition     = contains(["stdout", "stderr"], var.log_category)
    error_message = "log_category는 'stdout' 또는 'stderr'이어야 합니다."
  }
}

variable "tags" {
  description = "로그 리소스에 적용할 태그들입니다"
  type        = map(string)
  default     = {}
}
