# Terraform 백엔드 설정
terraform {
  backend "s3" {
    bucket = "cotept-terraform-state"
    key    = "dev/terraform.tfstate"
    region = "ap-chuncheon-1"

    endpoints = {
      s3 = "https://ax8d50ouwkrd.compat.objectstorage.ap-chuncheon-1.oraclecloud.com"
    }

    # S3 호환성을 위한 설정들
    skip_region_validation      = true # OCI는 AWS 리전이 아니므로 검증 스킵
    skip_credentials_validation = true # AWS 인증 검증 스킵
    skip_metadata_api_check     = true # AWS EC2 메타데이터 API 체크 스킵
    skip_requesting_account_id  = true
    use_path_style              = true # S3 호환 스토리지를 위한 경로 스타일 강제
    skip_s3_checksum            = true
  }
}
