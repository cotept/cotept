# Terraform 백엔드 설정
terraform {
  required_version = ">= 1.3.0, < 2.0.0"
  
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = ">= 6.27.0"
    }
    local = {
      source  = "hashicorp/local"
      version = ">= 2.4.0"
    }
  }
}
