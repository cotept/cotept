# modules/security/vault/outputs.tf

# Vault 정보
output "vault_id" {
  description = "생성된 Vault의 OCID입니다"
  value       = oci_kms_vault.app_vault.id
}

output "key_id" {
  description = "생성된 KMS 키의 OCID"
  value       = oci_kms_key.app_key.id
}

# 구조화된 시크릿 정보 (상세 정보 포함)
output "secrets" {
  description = "모든 시크릿 정보 (그룹화)"
  value = {
    database = {
      root_password = {
        id          = oci_vault_secret.db_root_password.id
        secret_name = oci_vault_secret.db_root_password.secret_name
        content     = base64decode(data.oci_secrets_secretbundle.db_root_password.secret_bundle_content[0].content)
      }
      app_password = {
        id          = oci_vault_secret.db_app_password.id
        secret_name = oci_vault_secret.db_app_password.secret_name
        content     = base64decode(data.oci_secrets_secretbundle.db_app_password.secret_bundle_content[0].content)
      }
    }
    application = {
      redis = {
        id          = oci_vault_secret.redis_password.id
        secret_name = oci_vault_secret.redis_password.secret_name
        content     = base64decode(data.oci_secrets_secretbundle.redis_password.secret_bundle_content[0].content)
      }
      jwt = {
        id          = oci_vault_secret.jwt_secret.id
        secret_name = oci_vault_secret.jwt_secret.secret_name
        content     = base64decode(data.oci_secrets_secretbundle.jwt_secret.secret_bundle_content[0].content)
      }
      turn = {
        user = {
          id          = oci_vault_secret.turn_user.id
          secret_name = oci_vault_secret.turn_user.secret_name
          content     = base64decode(data.oci_secrets_secretbundle.turn_user.secret_bundle_content[0].content)
        }
        password = {
          id          = oci_vault_secret.turn_password.id
          secret_name = oci_vault_secret.turn_password.secret_name
          content     = base64decode(data.oci_secrets_secretbundle.turn_password.secret_bundle_content[0].content)
        }
        realm = {
          id          = oci_vault_secret.turn_realm.id
          secret_name = oci_vault_secret.turn_realm.secret_name
          content     = base64decode(data.oci_secrets_secretbundle.turn_realm.secret_bundle_content[0].content)
        }
      }
    }
    # ssl = {
    #   private_key = {
    #     id          = oci_vault_secret.ssl_private_key.id
    #     secret_name = oci_vault_secret.ssl_private_key.secret_name
    #     content     = data.oci_vault_secret_version.ssl_private_key_current.content
    #   }
    #   certificate = {
    #     id          = oci_vault_secret.ssl_certificate.id
    #     secret_name = oci_vault_secret.ssl_certificate.secret_name
    #     content     = data.oci_vault_secret_version.ssl_certificate_current.content
    #   }
    #   ca_certificate = {
    #     id          = oci_vault_secret.ssl_ca_certificate.id
    #     secret_name = oci_vault_secret.ssl_ca_certificate.secret_name
    #     content     = data.oci_vault_secret_version.ssl_ca_certificate_current.content
    #   }
    # }
  }
  sensitive = true
}
