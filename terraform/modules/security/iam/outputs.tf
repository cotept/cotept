# modules/security/iam/outputs.tf

output "mentoring_dynamic_group_id" {
  description = "The OCID of the mentoring service dynamic group"
  value       = oci_identity_dynamic_group.mentoring_service.id
}

output "mentoring_dynamic_group_name" {
  description = "The name of the mentoring service dynamic group"
  value       = oci_identity_dynamic_group.mentoring_service.name
}

output "mentoring_policy_id" {
  description = "The OCID of the mentoring service policy"
  value       = oci_identity_policy.mentoring_service.id
}

output "policy_statements" {
  description = "List of all policy statements created"
  value       = oci_identity_policy.mentoring_service.statements
}

output "dynamic_group_matching_rule" {
  description = "The matching rule used for the dynamic group"
  value       = oci_identity_dynamic_group.mentoring_service.matching_rule
}
