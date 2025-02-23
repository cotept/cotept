# modules/certificate/variables.tf

variable "compartment_id" {
  type        = string
  description = "Compartment OCID"

  validation {
    condition     = can(regex("^ocid1.compartment.", var.compartment_id))
    error_message = "Compartment ID는 'ocid1.compartment.'로 시작하는 유효한 OCID여야 합니다."
  }
}

variable "project_name" {
  type        = string
  description = "Project name for resource naming"

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "프로젝트 이름은 소문자, 숫자, 하이픈만 포함할 수 있습니다."
  }
}

variable "environment" {
  type        = string
  description = "Environment name (dev, staging, prod)"

  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "Environment는 'dev',  'prod' 중 하나여야 합니다."
  }
}

variable "vault_key_id" {
  type        = string
  description = "OCID of the KMS key from vault module"

  validation {
    condition     = can(regex("^ocid1.key.", var.vault_key_id))
    error_message = "Vault Key ID는 'ocid1.key.'로 시작하는 유효한 OCID여야 합니다."
  }
}

variable "certificate_validity_period" {
  description = "인증서 유효기간 (시간)"
  type        = number
  default     = 8760 # 1년
}

variable "notification_topic_id" {
  description = "알림을 받을 OCI Notification Topic의 OCID"
  type        = string
}
