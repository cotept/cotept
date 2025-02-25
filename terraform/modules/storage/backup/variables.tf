# modules/storage/variables.tf
variable "compartment_id" {
  description = "The OCID of the compartment where the bucket will be created"
  type        = string
}

variable "bucket_name" {
  description = "The name of the bucket"
  type        = string
}
variable "domain_name" {
  description = "The name of the domain"
  type        = string
}
variable "region" {
  description = "The region where resources will be created"
  type        = string
}

variable "bucket_access_type" {
  description = "The access type for the bucket. Valid values: NoPublicAccess, ObjectRead, ObjectReadWithoutList"
  type        = string
  default     = "NoPublicAccess"
}

variable "versioning" {
  description = "The versioning status on the bucket. Valid values: Enabled, Suspended, Disabled"
  type        = string
  default     = "Enabled"
}

variable "storage_tier" {
  description = "The storage tier for the bucket. Valid values: Standard, Archive"
  type        = string
  default     = "Standard"
}

variable "environment" {
  description = "The environment (dev, staging, prod)"
  type        = string
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
}

variable "create_folder_structure" {
  description = "Whether to create the initial folder structure"
  type        = bool
  default     = false
}

variable "initial_folders" {
  description = "List of initial folders to create"
  type        = list(string)
  default     = ["vod", "frontend/static", "assets/common"]
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
}

variable "auto_tiering" {
  description = "The auto tiering status on the bucket. Valid values: Enabled, Disabled"
  type        = string
  default     = "Disabled"
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
