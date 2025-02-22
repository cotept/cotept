# environments/dev/main.tf

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
