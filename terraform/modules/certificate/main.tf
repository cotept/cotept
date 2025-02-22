# modules/certificate/main.tf

# Certificate Authority (CA) 생성
resource "oci_certificates_management_certificate_authority" "ca" {
  compartment_id = var.compartment_id
  name           = "${var.project_name}-${var.environment}-ca"
  description    = "Certificate Authority for ${var.project_name}.me"

  certificate_authority_config {
    config_type       = "ROOT_CA_GENERATED"
    signing_algorithm = "SHA256_WITH_RSA"
    subject {
      common_name         = "${var.project_name}.me"
      organizational_unit = "DevOps"
      organization        = upper(var.project_name)
      country             = "KR"
    }
    validity {
      time_of_validity_not_before = timeadd(timestamp(), "0h")
      time_of_validity_not_after  = timeadd(timestamp(), "${var.certificate_validity_period}h") # 1년
    }
  }

  kms_key_id = var.vault_key_id

  freeform_tags = {
    "Environment" = var.environment
    "Project"     = var.project_name
    "ManagedBy"   = "terraform"
    "Service"     = "tls"
    "Component"   = "ca"
  }
}

# 와일드카드 인증서 생성
resource "oci_certificates_management_certificate" "wildcard" {
  compartment_id = var.compartment_id
  name           = "${var.project_name}-${var.environment}-wildcard"
  description    = "Wildcard certificate for *.${var.project_name}.me"

  certificate_config {
    config_type = "MANAGED_INTERNAL_CA_ISSUED"

    certificate_profile_type = "TLS_SERVER"

    subject {
      common_name         = "*.${var.project_name}.me"
      country             = "KR"
      organization        = upper(var.project_name)
      organizational_unit = "DevOps"
    }

    validity {
      time_of_validity_not_before = timeadd(timestamp(), "0h")
      time_of_validity_not_after  = timeadd(timestamp(), "${var.certificate_validity_period}h") # 1년
    }

    key_algorithm       = "RSA2048"
    signature_algorithm = "SHA256_WITH_RSA"
  }
  freeform_tags = {
    "Environment" = var.environment
    "Project"     = var.project_name
    "ManagedBy"   = "terraform"
    "Service"     = "certificate"
  }
}

# 인증서 만료 알림 설정
resource "oci_monitoring_alarm" "certificate_expiry" {
  compartment_id = var.compartment_id
  display_name   = "${var.project_name}-${var.environment}-cert-expiry"
  is_enabled     = true

  metric_compartment_id = var.compartment_id
  namespace             = "oci_certificatesmanagement"
  query                 = "CertificateExpiryTime[1d] < 30" # 만료 30일 전

  severity = "CRITICAL"

  body         = "인증서가 30일 이내에 만료됩니다. 자동 갱신 상태를 확인해주세요."
  destinations = [var.notification_topic_id]

  freeform_tags = {
    "Environment" = var.environment
    "Project"     = var.project_name
    "ManagedBy"   = "terraform"
    "Service"     = "monitoring"
  }
}

# 인증서 갱신 실패 알림 설정
resource "oci_monitoring_alarm" "certificate_renewal_failure" {
  compartment_id = var.compartment_id
  display_name   = "${var.project_name}-${var.environment}-renewal-failure"
  is_enabled     = true

  metric_compartment_id = var.compartment_id
  namespace             = "oci_certificatesmanagement"
  query                 = "CertificateRenewalFailure[15m] > 0"

  severity = "CRITICAL"

  body         = "인증서 자동 갱신에 실패했습니다. 수동 확인이 필요합니다."
  destinations = [var.notification_topic_id]

  freeform_tags = {
    "Environment" = var.environment
    "Project"     = var.project_name
    "ManagedBy"   = "terraform"
    "Service"     = "monitoring"
  }
}
