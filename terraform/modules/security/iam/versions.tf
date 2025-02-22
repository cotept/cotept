# modules/security/iam/versions.tf

terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 4.0"
    }
  }
  required_version = ">= 1.0.0"
}
