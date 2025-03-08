# modules/database/atp/outputs.tf

output "id" {
  description = "생성된 Autonomous Database의 OCID"
  value       = oci_database_autonomous_database.atp.id
}

output "db_name" {
  description = "데이터베이스 이름"
  value       = oci_database_autonomous_database.atp.db_name
}

# 전체 connection_strings 객체 반환으로 변경
output "connection_strings" {
  description = "모든 연결 문자열 정보"
  value       = oci_database_autonomous_database.atp.connection_strings
  sensitive   = true
}

output "connection_urls" {
  description = "모든 가능한 연결 URL"
  value       = oci_database_autonomous_database.atp.connection_urls
  sensitive   = true
}

output "service_console_url" {
  description = "서비스 콘솔 URL"
  value       = oci_database_autonomous_database.atp.service_console_url
}

output "wallet_content" {
  description = "데이터베이스 지갑 콘텐츠 (Base64로 인코딩됨)"
  value       = oci_database_autonomous_database_wallet.atp_wallet.content
  sensitive   = true
}

output "wallet_secret_id" {
  description = "OCI Vault에 저장된 지갑 시크릿의 OCID"
  value       = var.create_vault_secrets && var.vault_id != null && var.vault_key_id != null ? oci_vault_secret.atp_wallet[0].id : null
}

output "wallet_secret_name" {
  description = "OCI Vault에 저장된 지갑 시크릿의 이름"
  value       = var.create_vault_secrets && var.vault_id != null && var.vault_key_id != null ? oci_vault_secret.atp_wallet[0].secret_name : null
}

output "wallet_password_secret_id" {
  description = "OCI Vault에 저장된 지갑 비밀번호 시크릿의 OCID"
  value       = var.create_vault_secrets && var.vault_id != null && var.vault_key_id != null ? oci_vault_secret.atp_wallet_password[0].id : null
}

output "wallet_password_secret_name" {
  description = "OCI Vault에 저장된 지갑 비밀번호 시크릿의 이름"
  value       = var.create_vault_secrets && var.vault_id != null && var.vault_key_id != null ? oci_vault_secret.atp_wallet_password[0].secret_name : null
}
