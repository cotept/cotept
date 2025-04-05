# modules/database/atp/main.tf

locals {
  # 하이픈이나 언더스코어 없이 알파벳과 숫자만 사용
  db_name = replace(lower("${var.project_name}${var.environment}db"), "-", "")

  # 화면 표시용 이름은 더 읽기 쉽게 유지
  display_name = "${var.project_name}-${var.environment}-db"

  common_tags = merge(
    {
      "Environment" = var.environment
      "Project"     = var.project_name
      "ManagedBy"   = "terraform"
      "Service"     = "database"
    },
    var.additional_tags
  )
}

# Autonomous Database 인스턴스 생성
resource "oci_database_autonomous_database" "atp" {
  compartment_id = var.compartment_id
  db_name        = local.db_name # 언더스코어만 허용
  display_name   = local.display_name
  db_workload    = "OLTP"
  is_free_tier   = true
  cpu_core_count = 1
  # data_storage_size_in_tbs = "0.02" # 20GB (무료 티어 한도) 프리티어에서는 이 옵션이 무시된다.
  admin_password = var.admin_password

  # 무료 티어 관련 참고 사항:
  # - 무료 티어는 공개 엔드포인트만 지원 (private endpoint 설정 불가)
  # - 무료 티어는 자동 스케일링 미지원
  # - Always Free 계정당 최대 2개의 Autonomous Database 생성 가능
  # - 자동 백업은 기본 활성화됨

  # 기타 설정
  freeform_tags = merge(
    local.common_tags,
    {
      "PreferredConnectionService" = var.preferred_connection_service
    }
  )
}

# 데이터베이스 지갑 다운로드 (연결 정보)
# 이 리소스는 수동으로 Wallet을 다운로드할 수 있도록 유지합니다.
# OCI 콘솔에서 직접 다운로드 후 ~/oracle-wallet 등의 위치에 보관하세요.
resource "oci_database_autonomous_database_wallet" "atp_wallet" {
  autonomous_database_id = oci_database_autonomous_database.atp.id
  password               = var.wallet_password
  base64_encode_content  = true
  generate_type          = "SINGLE"
}

# OCI Vault에 wallet 저장은 크기 제한으로 주석 처리함
# 필요시 Object Storage를 사용하는 것을 고려해볼 수 있음
# resource "oci_vault_secret" "atp_wallet" {
#   count          = var.create_vault_secrets && var.vault_id != null && var.vault_key_id != null ? 1 : 0
#   compartment_id = var.compartment_id
#   vault_id       = var.vault_id
#   key_id         = var.vault_key_id
#   secret_name    = "${var.project_name}-${var.environment}-atp-wallet"
#   description    = "ATP Wallet for ${var.project_name} ${var.environment} environment"
#
#   secret_content {
#     content_type = "BASE64"
#     content      = oci_database_autonomous_database_wallet.atp_wallet.content
#   }
#
#   # 버전 관리용 태그
#   metadata = {
#     "terraform_managed" = "true"
#     "project"           = var.project_name
#     "environment"       = var.environment
#     "created_at"        = timestamp()
#   }
# }

# 월렛 비밀번호도 Vault에 저장
resource "oci_vault_secret" "atp_wallet_password" {
  count          = var.create_vault_secrets && var.vault_id != null && var.vault_key_id != null ? 1 : 0
  compartment_id = var.compartment_id
  vault_id       = var.vault_id
  key_id         = var.vault_key_id
  secret_name    = "${var.project_name}-${var.environment}-atp-wallet-password"
  description    = "ATP Wallet password for ${var.project_name} ${var.environment} environment"

  secret_content {
    content_type = "BASE64"
    content      = base64encode(var.wallet_password)
  }

  # 버전 관리용 태그
  metadata = {
    "terraform_managed" = "true"
    "project"           = var.project_name
    "environment"       = var.environment
    "created_at"        = timestamp()
  }
}
