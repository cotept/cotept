# provider.tf - OCI Provider 설정
provider "oci" {
  region           = var.region
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
}

# Terraform 설정
terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 4.123.0"
    }
  }
  required_version = ">= 1.0.0"
}
