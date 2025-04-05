# provider.tf
provider "aws" {
  # This AWS provider is configured only for OCI Object Storage S3 compatibility
  # and is not used for actual AWS resources
  region                      = "ap-chuncheon-1"
  skip_credentials_validation = true
  skip_requesting_account_id  = true
  skip_metadata_api_check     = true
  s3_use_path_style           = true

  endpoints {
    s3 = "https://ax8d50ouwkrd.compat.objectstorage.ap-chuncheon-1.oraclecloud.com"
  }
}

provider "oci" {
  region       = var.region
  tenancy_ocid = var.tenancy_ocid
  # OCI CLI 설정에서 기본 프로필 사용
  # ~/.oci/config 파일의 설정을 사용합니다
  auth                = "SecurityToken"
  config_file_profile = "DEFAULT"
}

terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 4.123.0"
    }
  }
  required_version = ">= 1.0.0"
}
