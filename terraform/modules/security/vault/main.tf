# modules/security/vault/main.tf

# 환경별 Vault 생성
resource "oci_kms_vault" "app_vault" {
  compartment_id = var.compartment_id
  display_name   = "${var.project_name}-${var.environment}-vault"
  vault_type     = "DEFAULT"

  freeform_tags = {
    "Environment" = var.environment
    "Project"     = var.project_name
    "ManagedBy"   = "terraform"
    "Service"     = "vault"
  }
}

# KMS 키 생성
resource "oci_kms_key" "app_key" {
  compartment_id      = var.compartment_id
  display_name        = "${var.project_name}-${var.environment}-key"
  management_endpoint = oci_kms_vault.app_vault.management_endpoint

  key_shape {
    algorithm = "AES"
    length    = 32
  }
}

# DB 관련 시크릿
resource "oci_vault_secret" "db_root_password" {
  compartment_id         = var.compartment_id
  vault_id               = oci_kms_vault.app_vault.id
  key_id                 = oci_kms_key.app_key.id
  secret_name            = "${var.project_name}-${var.environment}-db-root-password"
  current_version_number = var.secret_version

  secret_content {
    content_type = "BASE64"
    content      = base64encode(var.db_root_password)
    stage        = "CURRENT"
  }

  description = "PostgreSQL root user password for ${var.environment} environment"

  freeform_tags = {
    "Environment" = var.environment
    "Project"     = var.project_name
    "ManagedBy"   = "terraform"
    "Service"     = "postgresql"
    "Type"        = "database"
    "Version"     = var.secret_version
  }
}

resource "oci_vault_secret" "db_app_password" {
  compartment_id         = var.compartment_id
  vault_id               = oci_kms_vault.app_vault.id
  key_id                 = oci_kms_key.app_key.id
  secret_name            = "${var.project_name}-${var.environment}-db-app-password"
  current_version_number = var.secret_version

  secret_content {
    content_type = "BASE64"
    content      = base64encode(var.db_app_password)
    stage        = "CURRENT"
  }

  description = "PostgreSQL application user password for ${var.environment} environment"

  freeform_tags = {
    "Environment" = var.environment
    "Project"     = var.project_name
    "ManagedBy"   = "terraform"
    "Service"     = "postgresql"
    "Type"        = "database"
    "Version"     = var.secret_version
  }
}

# Redis 관련 시크릿
resource "oci_vault_secret" "redis_password" {
  compartment_id         = var.compartment_id
  vault_id               = oci_kms_vault.app_vault.id
  key_id                 = oci_kms_key.app_key.id
  secret_name            = "${var.project_name}-${var.environment}-redis-password"
  current_version_number = var.secret_version

  secret_content {
    content_type = "BASE64"
    content      = base64encode(var.redis_password)
    stage        = "CURRENT"
  }

  description = "Redis authentication password for ${var.environment} environment"

  freeform_tags = {
    "Environment" = var.environment
    "Project"     = var.project_name
    "ManagedBy"   = "terraform"
    "Service"     = "redis"
    "Type"        = "cache"
    "Version"     = var.secret_version
  }
}

# API 서버 관련 시크릿
resource "oci_vault_secret" "jwt_secret" {
  compartment_id         = var.compartment_id
  vault_id               = oci_kms_vault.app_vault.id
  key_id                 = oci_kms_key.app_key.id
  secret_name            = "${var.project_name}-${var.environment}-jwt-secret"
  current_version_number = var.secret_version

  secret_content {
    content_type = "BASE64"
    content      = base64encode(var.jwt_secret)
    stage        = "CURRENT"
  }

  description = "JWT signing secret for ${var.environment} environment"

  freeform_tags = {
    "Environment" = var.environment
    "Project"     = var.project_name
    "ManagedBy"   = "terraform"
    "Service"     = "api"
    "Type"        = "authentication"
    "Version"     = var.secret_version
  }
}

# Coturn 관련 시크릿
resource "oci_vault_secret" "turn_password" {
  compartment_id         = var.compartment_id
  vault_id               = oci_kms_vault.app_vault.id
  key_id                 = oci_kms_key.app_key.id
  secret_name            = "${var.project_name}-${var.environment}-turn-password"
  current_version_number = var.secret_version

  secret_content {
    content_type = "BASE64"
    content      = base64encode(var.turn_password)
    stage        = "CURRENT"
  }

  description = "Coturn authentication password for ${var.environment} environment"

  freeform_tags = {
    "Environment" = var.environment
    "Project"     = var.project_name
    "ManagedBy"   = "terraform"
    "Service"     = "coturn"
    "Type"        = "webrtc"
    "Version"     = var.secret_version
  }
}

# SSL 인증서 관련 시크릿
resource "oci_vault_secret" "ssl_private_key" {
  compartment_id         = var.compartment_id
  vault_id               = oci_kms_vault.app_vault.id
  key_id                 = oci_kms_key.app_key.id
  secret_name            = "${var.project_name}-${var.environment}-ssl-private-key"
  current_version_number = var.secret_version

  secret_content {
    content_type = "BASE64"
    content      = base64encode(var.ssl_private_key)
    stage        = "CURRENT"
  }

  description = "SSL private key for ${var.environment} environment"

  freeform_tags = {
    "Environment" = var.environment
    "Project"     = var.project_name
    "ManagedBy"   = "terraform"
    "Service"     = "ssl"
    "Type"        = "certificate"
    "Version"     = var.secret_version
  }
}

resource "oci_vault_secret" "ssl_certificate" {
  compartment_id         = var.compartment_id
  vault_id               = oci_kms_vault.app_vault.id
  key_id                 = oci_kms_key.app_key.id
  secret_name            = "${var.project_name}-${var.environment}-ssl-certificate"
  current_version_number = var.secret_version

  secret_content {
    content_type = "BASE64"
    content      = base64encode(var.ssl_certificate)
    stage        = "CURRENT"
  }

  description = "SSL certificate for ${var.environment} environment"

  freeform_tags = {
    "Environment" = var.environment
    "Project"     = var.project_name
    "ManagedBy"   = "terraform"
    "Service"     = "ssl"
    "Type"        = "certificate"
    "Version"     = var.secret_version
  }
}

resource "oci_vault_secret" "ssl_ca_certificate" {
  compartment_id         = var.compartment_id
  vault_id               = oci_kms_vault.app_vault.id
  key_id                 = oci_kms_key.app_key.id
  secret_name            = "${var.project_name}-${var.environment}-ssl-ca-certificate"
  current_version_number = var.secret_version

  secret_content {
    content_type = "BASE64"
    content      = base64encode(var.ssl_ca_certificate)
    stage        = "CURRENT"
  }

  description = "SSL CA certificate for ${var.environment} environment"

  freeform_tags = {
    "Environment" = var.environment
    "Project"     = var.project_name
    "ManagedBy"   = "terraform"
    "Service"     = "ssl"
    "Type"        = "certificate"
    "Version"     = var.secret_version
  }
}

# 시크릿 데이터 소스
data "oci_vault_secret" "db_root_password" {
  secret_id = oci_vault_secret.db_root_password.id
}

data "oci_vault_secret" "db_app_password" {
  secret_id = oci_vault_secret.db_app_password.id
}

data "oci_vault_secret" "redis_password" {
  secret_id = oci_vault_secret.redis_password.id
}

data "oci_vault_secret" "jwt_secret" {
  secret_id = oci_vault_secret.jwt_secret.id
}

data "oci_vault_secret" "turn_password" {
  secret_id = oci_vault_secret.turn_password.id
}

data "oci_vault_secret" "ssl_private_key" {
  secret_id = oci_vault_secret.ssl_private_key.id
}

data "oci_vault_secret" "ssl_certificate" {
  secret_id = oci_vault_secret.ssl_certificate.id
}

data "oci_vault_secret" "ssl_ca_certificate" {
  secret_id = oci_vault_secret.ssl_ca_certificate.id
}

# 현재 버전 데이터 소스
data "oci_vault_secret_version" "db_root_password_current" {
  secret_id             = oci_vault_secret.db_root_password.id
  secret_version_number = oci_vault_secret.db_root_password.current_version_number
}

data "oci_vault_secret_version" "db_app_password_current" {
  secret_id             = oci_vault_secret.db_app_password.id
  secret_version_number = oci_vault_secret.db_app_password.current_version_number
}

data "oci_vault_secret_version" "redis_password_current" {
  secret_id             = oci_vault_secret.redis_password.id
  secret_version_number = oci_vault_secret.redis_password.current_version_number
}

data "oci_vault_secret_version" "jwt_secret_current" {
  secret_id             = oci_vault_secret.jwt_secret.id
  secret_version_number = oci_vault_secret.jwt_secret.current_version_number
}

data "oci_vault_secret_version" "turn_password_current" {
  secret_id             = oci_vault_secret.turn_password.id
  secret_version_number = oci_vault_secret.turn_password.current_version_number
}

data "oci_vault_secret_version" "ssl_private_key_current" {
  secret_id             = oci_vault_secret.ssl_private_key.id
  secret_version_number = oci_vault_secret.ssl_private_key.current_version_number
}

data "oci_vault_secret_version" "ssl_certificate_current" {
  secret_id             = oci_vault_secret.ssl_certificate.id
  secret_version_number = oci_vault_secret.ssl_certificate.current_version_number
}

data "oci_vault_secret_version" "ssl_ca_certificate_current" {
  secret_id             = oci_vault_secret.ssl_ca_certificate.id
  secret_version_number = oci_vault_secret.ssl_ca_certificate.current_version_number
}

# 프로젝트 시크릿 목록
data "oci_vault_secrets" "project_secrets" {
  compartment_id = var.compartment_id
  vault_id       = oci_kms_vault.app_vault.id

  filter {
    name   = "lifecycle_state"
    values = ["ACTIVE"]
  }
}
