# modules/storage/variables.tf
variable "compartment_id" {
  description = "OCID of the compartment to create the resources in"
  type        = string
}

variable "bucket_name" {
  description = "Name of the bucket"
  type        = string
}

variable "bucket_access_type" {
  description = "The type of public access enabled on this bucket"
  type        = string
  default     = "NoPublicAccess"
}

variable "versioning" {
  description = "Whether or not versioning is enabled on this bucket"
  type        = bool
  default     = false
}

variable "storage_tier" {
  description = "The storage tier of this bucket"
  type        = string
  default     = "Standard"
}
