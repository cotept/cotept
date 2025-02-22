# modules/waf/variables.tf
variable "project_name" {
  type        = string
  description = "The name of the project"
}

variable "environment" {
  type        = string
  description = "The environment (dev, prod)"
}

variable "compartment_id" {
  type        = string
  description = "The OCID of the compartment"
}

variable "region" {
  type        = string
  description = "The OCI region"
}

variable "api_origin" {
  type        = string
  description = "API server origin address for WebSocket connections"
}

variable "websocket_timeout" {
  type        = number
  description = "WebSocket connection timeout in seconds"
  default     = 60
}

variable "connection_timeout" {
  type        = number
  description = "General connection timeout in seconds"
  default     = 300
}
