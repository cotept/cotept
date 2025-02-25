# modules/security/iam/outputs.tf

# 동적 그룹 출력
output "mentoring_dynamic_group_id" {
  description = "The OCID of the mentoring service dynamic group"
  value       = oci_identity_dynamic_group.mentoring_service.id
}

output "mentoring_dynamic_group_name" {
  description = "The name of the mentoring service dynamic group"
  value       = oci_identity_dynamic_group.mentoring_service.name
}

# 정책 출력
output "admin_policy_id" {
  description = "The OCID of the admin policy"
  value       = oci_identity_policy.admin_policy.id
}

output "admin_policy_statements" {
  description = "List of all admin policy statements created"
  value       = oci_identity_policy.admin_policy.statements
}

# 그룹 출력
output "administrators_group_id" {
  description = "The OCID of the administrators group"
  value       = oci_identity_group.administrators.id
}

output "administrators_group_name" {
  description = "The name of the administrators group"
  value       = oci_identity_group.administrators.name
}

# 컴파트먼트 출력
output "policy_compartment_id" {
  description = "The compartment ID where policies are applied"
  value       = var.compartment_id
}
