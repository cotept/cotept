# modules/security/iam/variables.tf

variable "tenancy_ocid" {
  description = "The OCID of the tenancy where the dynamic group will be created"
  type        = string

  validation {
    condition     = can(regex("^ocid1.tenancy.", var.tenancy_ocid))
    error_message = "The tenancy_ocid must be a valid OCID starting with 'ocid1.tenancy.'."
  }
}

variable "compartment_id" {
  description = "The OCID of the compartment where resources will be created"
  type        = string

  validation {
    condition     = can(regex("^ocid1.compartment.", var.compartment_id))
    error_message = "The compartment_id must be a valid OCID starting with 'ocid1.compartment.'."
  }
}

variable "environment" {
  description = "The environment (dev, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "Environment must be one of: dev, prod."
  }
}

variable "project_name" {
  description = "The name of the project"
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "Project name must contain only lowercase letters, numbers, and hyphens."
  }
}
