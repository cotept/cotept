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

output "wallet_password" {
  description = "Wallet password (sensitive)"
  value       = var.wallet_password
  sensitive   = true
}

output "wallet_setup_instructions" {
  description = "Wallet 설정 안내"
  value       = <<EOT
### Oracle Wallet 설정 안내 ###

1. OCI 콘솔에서 ATP(${oci_database_autonomous_database.atp.display_name}) 대시보드로 이동
2. "DB 연결" 버튼 클릭
3. "Wallet 다운로드" 선택
4. 비밀번호 입력 (terraform에서 설정한 wallet_password)
5. 다운로드된 zip 파일을 원하는 위치로 이동 (예: ~/oracle-wallet)

6. zshrc에 환경변수 추가:

```bash
# ~/.zshrc 파일에 추가
export TNS_ADMIN=~/oracle-wallet                     # Wallet이 위치한 경로
export WALLET_PASSWORD="${var.wallet_password}"      # Wallet 비밀번호
export DB_USER="ADMIN"                             # 기본 관리자 계정
export DB_PASSWORD="${var.admin_password}"         # 데이터베이스 비밀번호
export DB_CONNECT_STRING="${local.db_name}_high"   # 연결 문자열
```

7. 환경변수 적용:
```bash
source ~/.zshrc
```

8. DBeaver 또는 다른 SQL 클라이언트에서 TNS_ADMIN 경로를 지정하여 사용하세요.
EOT
}

output "connection_url" {
  description = "JDBC connection URL for this ATP instance"
  value       = "jdbc:oracle:thin:@${local.db_name}_high?TNS_ADMIN=/path/to/wallet"
}

output "wallet_password_secret_id" {
  description = "OCI Vault에 저장된 지갑 비밀번호 시크릿의 OCID"
  value       = var.create_vault_secrets && var.vault_id != null && var.vault_key_id != null ? oci_vault_secret.atp_wallet_password[0].id : null
}

output "wallet_password_secret_name" {
  description = "OCI Vault에 저장된 지갑 비밀번호 시크릿의 이름"
  value       = var.create_vault_secrets && var.vault_id != null && var.vault_key_id != null ? oci_vault_secret.atp_wallet_password[0].secret_name : null
}
