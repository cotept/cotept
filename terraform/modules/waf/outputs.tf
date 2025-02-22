# modules/waf/outputs.tf
output "waf_id" {
  description = "The OCID of the WAF policy"
  value       = oci_waas_waas_policy.main_waf.id
}

output "waf_domain" {
  description = "The domain protected by WAF"
  value       = oci_waas_waas_policy.main_waf.domain
}

output "additional_domains" {
  description = "Additional domains protected by WAF"
  value       = oci_waas_waas_policy.main_waf.additional_domains
}

output "waf_policy_name" {
  description = "The name of the WAF policy"
  value       = oci_waas_waas_policy.main_waf.display_name
}
