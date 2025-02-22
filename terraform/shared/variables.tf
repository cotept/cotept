# variables.tf

variable "tenancy_ocid" {
  description = "테넌시의 OCID"
  type        = string

  validation {
    condition     = can(regex("^ocid1.tenancy.", var.tenancy_ocid))
    error_message = "The tenancy_ocid must be a valid OCID starting with 'ocid1.tenancy.'."
  }
}

variable "user_ocid" {
  description = "사용자의 OCID"
  type        = string

  validation {
    condition     = can(regex("^ocid1.user.", var.user_ocid))
    error_message = "The user_ocid must be a valid OCID starting with 'ocid1.user.'."
  }
}

variable "fingerprint" {
  description = "API 키의 fingerprint"
  type        = string
}

variable "private_key_path" {
  description = "API 개인키 파일의 경로"
  type        = string
}

variable "region" {
  description = "OCI 리전"
  type        = string
  default     = "ap-chuncheon-1"
}
