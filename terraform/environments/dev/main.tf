# environments/dev/main.tf

# 1. IAM 모듈 (권한 관리)
module "iam" {
  source = "../../modules/security/iam"

  compartment_id = var.compartment_id
  tenancy_ocid   = var.tenancy_ocid
  environment    = var.environment
  project_name   = var.project_name
}

# 2. Vault 모듈 (시크릿 관리)
module "vault" {
  source = "../../modules/security/vault"

  compartment_id = var.compartment_id
  project_name   = var.project_name
  environment    = var.environment

  # 시크릿 값 설정
  db_root_password = var.db_root_password # 변수명 수정
  db_app_password  = var.db_app_password  # 변수명 수정
  redis_password   = var.redis_password
  jwt_secret       = var.jwt_secret
  turn_user        = var.turn_user
  turn_password    = var.turn_password
  turn_realm       = var.turn_realm
  # ssl_private_key    = file(var.ssl_private_key_path)
  # ssl_certificate    = file(var.ssl_public_cert_path)
  # ssl_ca_certificate = file(var.ssl_ca_cert_path)

  depends_on = [module.iam]
}

# # 3. Network 모듈 (네트워크 인프라)
module "network" {
  source = "../../modules/network"

  compartment_id = var.compartment_id
  environment    = "dev"
  project_name   = var.project_name
  region         = var.region # 이 줄 추가

  # VCN 및 서브넷 CIDR 설정
  vcn_cidr                     = "10.0.0.0/16"
  public_subnet_cidr           = "10.0.1.0/24" # 로드밸런서, Coturn용
  private_app_subnet_cidr      = "10.0.2.0/24" # API 서버용
  private_database_subnet_cidr = "10.0.3.0/24" # PostgreSQL, Redis용

  # WebRTC 관련 포트 설정
  allowed_webrtc_ports = {
    min = 49152
    max = 65535
  }

  additional_tags = var.additional_tags
}

