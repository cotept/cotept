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
  compartment_id = var.compartment_id
  vault_id       = oci_kms_vault.app_vault.id
  key_id         = oci_kms_key.app_key.id
  secret_name    = "${var.project_name}-${var.environment}-db-root-password"


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
  }
}

resource "oci_vault_secret" "db_app_password" {
  compartment_id = var.compartment_id
  vault_id       = oci_kms_vault.app_vault.id
  key_id         = oci_kms_key.app_key.id
  secret_name    = "${var.project_name}-${var.environment}-db-app-password"


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
  }
}

# Redis 관련 시크릿
resource "oci_vault_secret" "redis_password" {
  compartment_id = var.compartment_id
  vault_id       = oci_kms_vault.app_vault.id
  key_id         = oci_kms_key.app_key.id
  secret_name    = "${var.project_name}-${var.environment}-redis-password"


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
  }
}

# API 서버 관련 시크릿
resource "oci_vault_secret" "jwt_secret" {
  compartment_id = var.compartment_id
  vault_id       = oci_kms_vault.app_vault.id
  key_id         = oci_kms_key.app_key.id
  secret_name    = "${var.project_name}-${var.environment}-jwt-secret"


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
  }
}

# Coturn 관련 시크릿
resource "oci_vault_secret" "turn_user" {
  compartment_id = var.compartment_id
  vault_id       = oci_kms_vault.app_vault.id
  key_id         = oci_kms_key.app_key.id
  secret_name    = "${var.project_name}-${var.environment}-turn-user"


  secret_content {
    content_type = "BASE64"
    content      = base64encode(var.turn_user)
    stage        = "CURRENT"
  }

  description = "Coturn authentication password for ${var.environment} environment"

  freeform_tags = {
    "Environment" = var.environment
    "Project"     = var.project_name
    "ManagedBy"   = "terraform"
    "Service"     = "coturn"
    "Type"        = "webrtc"
  }
}
resource "oci_vault_secret" "turn_password" {
  compartment_id = var.compartment_id
  vault_id       = oci_kms_vault.app_vault.id
  key_id         = oci_kms_key.app_key.id
  secret_name    = "${var.project_name}-${var.environment}-turn-password"


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
  }
}
resource "oci_vault_secret" "turn_realm" {
  compartment_id = var.compartment_id
  vault_id       = oci_kms_vault.app_vault.id
  key_id         = oci_kms_key.app_key.id
  secret_name    = "${var.project_name}-${var.environment}-turn-realm"


  secret_content {
    content_type = "BASE64"
    content      = base64encode(var.turn_realm)
    stage        = "CURRENT"
  }

  description = "Coturn authentication password for ${var.environment} environment"

  freeform_tags = {
    "Environment" = var.environment
    "Project"     = var.project_name
    "ManagedBy"   = "terraform"
    "Service"     = "coturn"
    "Type"        = "webrtc"
  }
}

# SSL 인증서 관련 시크릿
# resource "oci_vault_secret" "ssl_private_key" {
#   compartment_id         = var.compartment_id
#   vault_id               = oci_kms_vault.app_vault.id
#   key_id                 = oci_kms_key.app_key.id
#   secret_name            = "${var.project_name}-${var.environment}-ssl-private-key"


#   secret_content {
#     content_type = "BASE64"
#     content      = base64encode(var.ssl_private_key)
#     stage        = "CURRENT"
#   }

#   description = "SSL private key for ${var.environment} environment"

#   freeform_tags = {
#     "Environment" = var.environment
#     "Project"     = var.project_name
#     "ManagedBy"   = "terraform"
#     "Service"     = "ssl"
#     "Type"        = "certificate"
#  
#   }
# }

# resource "oci_vault_secret" "ssl_certificate" {
#   compartment_id         = var.compartment_id
#   vault_id               = oci_kms_vault.app_vault.id
#   key_id                 = oci_kms_key.app_key.id
#   secret_name            = "${var.project_name}-${var.environment}-ssl-certificate"


#   secret_content {
#     content_type = "BASE64"
#     content      = base64encode(var.ssl_certificate)
#     stage        = "CURRENT"
#   }

#   description = "SSL certificate for ${var.environment} environment"

#   freeform_tags = {
#     "Environment" = var.environment
#     "Project"     = var.project_name
#     "ManagedBy"   = "terraform"
#     "Service"     = "ssl"
#     "Type"        = "certificate"
#  
#   }
# }

# resource "oci_vault_secret" "ssl_ca_certificate" {
#   compartment_id         = var.compartment_id
#   vault_id               = oci_kms_vault.app_vault.id
#   key_id                 = oci_kms_key.app_key.id
#   secret_name            = "${var.project_name}-${var.environment}-ssl-ca-certificate"


#   secret_content {
#     content_type = "BASE64"
#     content      = base64encode(var.ssl_ca_certificate)
#     stage        = "CURRENT"
#   }

#   description = "SSL CA certificate for ${var.environment} environment"

#   freeform_tags = {
#     "Environment" = var.environment
#     "Project"     = var.project_name
#     "ManagedBy"   = "terraform"
#     "Service"     = "ssl"
#     "Type"        = "certificate"
#  
#   }
# }

# 시크릿 데이터 소스
data "oci_secrets_secretbundle" "db_root_password" {
  secret_id = oci_vault_secret.db_root_password.id
}

data "oci_secrets_secretbundle" "db_app_password" {
  secret_id = oci_vault_secret.db_app_password.id
}

data "oci_secrets_secretbundle" "redis_password" {
  secret_id = oci_vault_secret.redis_password.id
}

data "oci_secrets_secretbundle" "jwt_secret" {
  secret_id = oci_vault_secret.jwt_secret.id
}

data "oci_secrets_secretbundle" "turn_user" {
  secret_id = oci_vault_secret.turn_user.id
}

data "oci_secrets_secretbundle" "turn_password" {
  secret_id = oci_vault_secret.turn_password.id
}

data "oci_secrets_secretbundle" "turn_realm" {
  secret_id = oci_vault_secret.turn_realm.id
}

# data "oci_secrets_secretbundle" "ssl_private_key" {
#   secret_id = oci_vault_secret.ssl_private_key.id
# }

# data "oci_secrets_secretbundle" "ssl_certificate" {
#   secret_id = oci_vault_secret.ssl_certificate.id
# }

# data "oci_secrets_secretbundle" "ssl_ca_certificate" {
#   secret_id = oci_vault_secret.ssl_ca_certificate.id
# }

# 현재 버전 데이터 소s

# data "oci_vault_secret_version" "ssl_private_key_current" {
#   secret_id             = oci_vault_secret.ssl_private_key.id

# }

# data "oci_vault_secret_version" "ssl_certificate_current" {
#   secret_id             = oci_vault_secret.ssl_certificate.id

# }

# data "oci_vault_secret_version" "ssl_ca_certificate_current" {
#   secret_id             = oci_vault_secret.ssl_ca_certificate.id

# }

# 프로젝트 시크릿 목록
data "oci_vault_secrets" "project_secrets" {
  compartment_id = var.compartment_id
  vault_id       = oci_kms_vault.app_vault.id

  filter {
    name   = "lifecycle_state"
    values = ["ACTIVE"]
  }
}
