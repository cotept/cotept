# modules/dns/variables.tf

variable "compartment_id" {
  type        = string
  description = "Compartment OCID"
}

variable "load_balancer_ip" {
  type        = string
  description = "Load Balancer Public IP"
}

variable "coturn_server_ip" {
  type        = string
  description = "Coturn Server Public IP"
}

variable "cert_private_key_id" {
  type        = string
  description = "Vault Secret OCID for Certificate Private Key"
}

variable "cert_public_key_id" {
  type        = string
  description = "Vault Secret OCID for Certificate Public Key"
}

variable "load_balancer_id" {
  type        = string
  description = "Load Balancer OCID"
}

variable "static_cdn_domain" {
  type        = string
  description = "Static Content CDN Domain"
}

variable "vod_cdn_domain" {
  type        = string
  description = "VOD CDN Domain"
}

variable "api_domain" {
  type        = string
  description = "API Domain (www.api.subdomain)"
}

variable "turn_domain" {
  type        = string
  description = "TURN Server Domain"
}

variable "domain_name" {
  type        = string
  description = "기본 도메인 이름 (예: cotept.me)"
  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]\\.[a-z]{2,}$", var.domain_name))
    error_message = "도메인 이름이 올바른 형식이어야 합니다."
  }
}

variable "environment" {
  type        = string
  description = "환경 구분자 (dev, staging, prod)"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "환경은 dev, staging, prod 중 하나여야 합니다."
  }
}

variable "dns_ttl" {
  type        = number
  description = "DNS 레코드의 TTL (초)"
  default     = 300

  validation {
    condition     = var.dns_ttl >= 60 && var.dns_ttl <= 86400
    error_message = "TTL은 60초에서 86400초(24시간) 사이여야 합니다."
  }
}

variable "load_balancer_domain" {
  type        = string
  description = "로드밸런서의 도메인 이름"
}

variable "vault_secrets" {
  description = "Vault에서 관리되는 시크릿 정보입니다"
  type = object({
    ssl = object({
      private_key = object({
        content = string
      })
      certificate = object({
        content = string
      })
      ca_certificate = object({
        content = string
      })
    })
  })
  sensitive = true
}
