# modules/database/nosql/variables.tf

variable "compartment_id" {
  description = "리소스가 생성될 컴파트먼트의 OCID"
  type        = string
}

variable "project_name" {
  description = "프로젝트 이름"
  type        = string
}

variable "environment" {
  description = "환경 구분자 (dev, prod)"
  type        = string
}

variable "table_read_units" {
  description = "테이블당 최대 읽기 유닛"
  type        = number
  default     = 50  # 무료 티어 한도 내에서 설정
}

variable "table_write_units" {
  description = "테이블당 최대 쓰기 유닛"
  type        = number
  default     = 50  # 무료 티어 한도 내에서 설정
}

variable "table_storage_gb" {
  description = "테이블당 최대 스토리지 용량(GB)"
  type        = number
  default     = 25  # 무료 티어 최대 25GB
}

variable "additional_tags" {
  description = "모든 리소스에 추가될 태그"
  type        = map(string)
  default     = {}
}
