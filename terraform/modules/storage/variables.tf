# modules/storage/variables.tf
variable "compartment_id" {
  description = "The OCID of the compartment where the bucket will be created"
  type        = string

  validation {
    condition     = can(regex("^ocid1\\.(compartment|tenancy)\\.", var.compartment_id))
    error_message = "Compartment ID must be a valid OCID starting with 'ocid1.compartment.' or 'ocid1.tenancy.'."
  }
}

variable "bucket_name" {
  description = "The name of the bucket"
  type        = string

  # OCI 버킷 이름 규칙을 따르는지 검증
  validation {
    condition     = can(regex("^[a-zA-Z0-9-_]{1,63}$", var.bucket_name))
    error_message = "Bucket name must be 1-63 characters, containing only letters, numbers, hyphens and underscores."
  }
}

variable "domain_name" {
  description = "The name of the domain"
  type        = string
}

variable "region" {
  description = "The region where resources will be created"
  type        = string

  validation {
    condition     = can(regex("^[a-z]+-[a-z]+-[0-9]+$", var.region))
    error_message = "Region must be in format: region-location-number (e.g., ap-chuncheon-1)."
  }
}

variable "bucket_access_type" {
  description = "The access type for the bucket. Valid values: NoPublicAccess, ObjectRead, ObjectReadWithoutList"
  type        = string
  default     = "NoPublicAccess"

  validation {
    condition     = contains(["NoPublicAccess", "ObjectRead", "ObjectReadWithoutList"], var.bucket_access_type)
    error_message = "The bucket_access_type must be one of: NoPublicAccess, ObjectRead, ObjectReadWithoutList."
  }
}

variable "versioning" {
  description = "The versioning status on the bucket. Valid values: Enabled, Suspended, Disabled"
  type        = string
  default     = "Disabled"

  validation {
    condition     = contains(["Enabled", "Suspended", "Disabled"], var.versioning)
    error_message = "The versioning must be one of: Enabled, Suspended, Disabled."
  }
}

variable "storage_tier" {
  description = "The storage tier for the bucket. Valid values: Standard, Archive"
  type        = string
  default     = "Standard"

  validation {
    condition     = contains(["Standard", "Archive"], var.storage_tier)
    error_message = "The storage_tier must be one of: Standard, Archive."
  }
}

variable "environment" {
  description = "The environment (dev, staging, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "The environment must be one of: dev, staging, prod."
  }
}

variable "project_name" {
  description = "The name of the project"
  type        = string
}

variable "object_events_enabled" {
  description = "Whether or not events are emitted for object state changes in this bucket"
  type        = bool
  default     = false
}

variable "kms_key_id" {
  description = "The OCID of the KMS key used for encryption"
  type        = string
  default     = ""
}

variable "additional_tags" {
  description = "Additional tags to add to the bucket"
  type        = map(string)
  default     = {}
}

variable "cors_rules" {
  description = "A list of CORS rules for the bucket"
  type = list(object({
    allowed_headers    = list(string)
    allowed_methods    = list(string)
    allowed_origins    = list(string)
    expose_headers     = list(string)
    max_age_in_seconds = number
  }))
  default = []
}

variable "lifecycle_rules" {
  description = "A list of lifecycle rules for the bucket"
  type = list(object({
    name        = string
    target      = string # "objects" or "multipart-uploads"
    action      = string # "DELETE" or "ARCHIVE"
    time_amount = number
    time_unit   = string # "DAYS"
    prefix      = string # Objects with this prefix will be affected by this rule
  }))
  default = []

  validation {
    condition = alltrue([
      for rule in var.lifecycle_rules :
      contains(["objects", "multipart-uploads"], rule.target) &&
      contains(["DELETE", "ARCHIVE"], rule.action) &&
      contains(["DAYS"], rule.time_unit)
    ])
    error_message = "Lifecycle rules must have valid target (objects, multipart-uploads), action (DELETE, ARCHIVE), and time_unit (DAYS)."
  }
}

# VOD 파일을 위한 특화된 라이프사이클 정책
variable "vod_lifecycle_rules" {
  description = "VOD 파일에 대한 특화된 라이프사이클 관리 규칙"
  type = object({
    recent_vod_retention_days  = number # 최근 VOD 저장 기간
    archive_vod_retention_days = number # 아카이브로 이동 후 저장 기간
    incomplete_upload_days     = number # 미완료 멀티파트 업로드 정리 기간
  })
  default = {
    recent_vod_retention_days  = 30
    archive_vod_retention_days = 90
    incomplete_upload_days     = 1
  }
}

variable "create_folder_structure" {
  description = "Whether to create the initial folder structure"
  type        = bool
  default     = false
}

variable "initial_folders" {
  description = "List of initial folders to create"
  type        = list(string)
  default = [
    "vod/free",
    "vod/standard",
    "vod/premium",
    "vod/temp",
    "frontend/static/js",
    "frontend/static/css",
    "frontend/static/images",
    "assets/common",
    "downloads/temp"
  ]
}

variable "create_upload_par" {
  description = "Whether to create a pre-authenticated request for object uploads"
  type        = bool
  default     = false
}

variable "create_download_par" {
  description = "Whether to create a pre-authenticated request for object downloads"
  type        = bool
  default     = false
}

variable "par_expiry_time" {
  description = "The number of hours until the pre-authenticated request expires"
  type        = number
  default     = 168 # 7 days
}

# 절대 시간 형식의 PAR 만료 시간 - RFC3339 형식
variable "par_expiry_date" {
  description = "The absolute date when the PAR expires, in RFC3339 format (e.g., 2023-12-31T23:59:59Z)"
  type        = string
  default     = null # null이면 상대적 시간(par_expiry_time) 사용
}

variable "retention_rules" {
  description = "A list of retention rules for the bucket"
  type = list(object({
    display_name         = string
    time_rule_locked     = string # ISO 8601 format, e.g., "2023-12-31T23:59:59Z"
    duration_time_amount = number
    duration_time_unit   = string # "DAYS", "YEARS"
  }))
  default = []
}

variable "replication_enabled" {
  description = "Whether to enable replication for the bucket"
  type        = bool
  default     = false
}

variable "destination_bucket_name" {
  description = "The name of the destination bucket for replication"
  type        = string
  default     = ""
}

variable "destination_region_name" {
  description = "The region of the destination bucket for replication"
  type        = string
  default     = ""
}

variable "replication_deletion_behavior" {
  description = "Determines if delete operations are replicated to the destination. Valid values: ALLOW_DELETE, RETAIN_DELETE"
  type        = string
  default     = "RETAIN_DELETE"

  validation {
    condition     = contains(["ALLOW_DELETE", "RETAIN_DELETE"], var.replication_deletion_behavior)
    error_message = "The replication_deletion_behavior must be one of: ALLOW_DELETE, RETAIN_DELETE."
  }
}

variable "auto_tiering" {
  description = "The auto tiering status on the bucket. Valid values: Enabled, Disabled"
  type        = string
  default     = "Disabled"

  validation {
    condition     = contains(["Enabled", "Disabled"], var.auto_tiering)
    error_message = "The auto_tiering must be one of: Enabled, Disabled."
  }
}

variable "define_tags" {
  description = "Defined tags for the bucket"
  type        = map(string)
  default     = {}
}

# 대역폭 정책 변수
variable "create_rate_limit" {
  description = "Whether to create a rate limiting rule for the bucket"
  type        = bool
  default     = false
}

variable "rate_limit_per_client" {
  description = "The maximum rate at which data can be retrieved (in Mbps) per client IP"
  type        = number
  default     = 50 # 50 Mbps
}

# 객체 잠금 변수
variable "object_lock_enabled" {
  description = "Whether to enable the bucket for object locking"
  type        = bool
  default     = false
}

# 알림 구성 변수
variable "notification_topic_id" {
  description = "The OCID of the notification topic for bucket events"
  type        = string
  default     = ""
}

variable "notification_enabled" {
  description = "Whether to enable notifications for the bucket"
  type        = bool
  default     = false
}

variable "notification_events" {
  description = "List of events to trigger notifications"
  type        = list(string)
  default     = ["com.oraclecloud.objectstorage.createobject", "com.oraclecloud.objectstorage.deleteobject"]
}

# 로그 디렉토리 경로
variable "log_directory" {
  description = "Directory path for storing local execution logs"
  type        = string
  default     = "/tmp/terraform_logs"
}
