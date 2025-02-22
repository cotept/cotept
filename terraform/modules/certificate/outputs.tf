# modules/certificate/outputs.tf

output "certificate_authority_id" {
  description = "OCID of the Certificate Authority"
  value       = oci_certificates_management_certificate_authority.ca.id
}

output "wildcard_certificate_id" {
  description = "OCID of the Wildcard Certificate"
  value       = oci_certificates_management_certificate.wildcard.id
}

# 인증서 정보
output "certificate_details" {
  description = "Certificate details for load balancer configuration"
  value = {
    authority = {
      id          = oci_certificates_management_certificate_authority.ca.id
      name        = oci_certificates_management_certificate_authority.ca.name
      config_type = oci_certificates_management_certificate_authority.ca.certificate_authority_config[0].config_type
    }
    wildcard = {
      id          = oci_certificates_management_certificate.wildcard.id
      name        = oci_certificates_management_certificate.wildcard.name
      config_type = oci_certificates_management_certificate.wildcard.certificate_config[0].config_type
    }
  }
}
