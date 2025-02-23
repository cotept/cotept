# modules/security/iam/outputs.tf

# output "mentoring_dynamic_group_id" {
#   description = "The OCID of the mentoring service dynamic group"
#   value       = oci_identity_dynamic_group.mentoring_service.id
# }

# output "mentoring_dynamic_group_name" {
#   description = "The name of the mentoring service dynamic group"
#   value       = oci_identity_dynamic_group.mentoring_service.name
# }

# output "mentoring_policy_id" {
#   description = "The OCID of the mentoring service policy"
#   value       = oci_identity_policy.mentoring_service.id
# }

# output "policy_statements" {
#   description = "List of all policy statements created"
#   value       = oci_identity_policy.mentoring_service.statements
# }
output "admin_policy_statements" {
  description = "List of all admin group policy statements created"
  value       = oci_identity_policy.admin_policy.statements
}
# output "service_policy_statements" {
#   description = "List of all service policy statements created"
#   value       = oci_identity_policy.service_policy.statements
# }

# 관리자 정책의 OCID를 출력합니다. 이는 정책 업데이트나 다른 모듈에서의 참조를 위해 필요할 수 있습니다.
output "admin_policy_id" {
  description = "관리자 정책의 OCID입니다. 이 값은 정책 업데이트나 다른 리소스에서 참조할 때 사용됩니다."
  value       = oci_identity_policy.admin_policy.id
}

# 서비스 정책의 OCID를 출력합니다. 서비스 간 연동 설정이나 문제 해결 시 필요할 수 있습니다.
# output "service_policy_id" {
#   description = "서비스 정책의 OCID입니다. 이 값은 서비스 연동이나 문제 해결 시 참조됩니다."
#   value       = oci_identity_policy.service_policy.id
# }

# 관리자 그룹 이름을 출력합니다. 다른 모듈에서 이 그룹에 대한 추가 권한을 설정할 때 사용할 수 있습니다.
output "administrators_group_name" {
  description = "관리자 그룹의 이름입니다. 이 값은 추가 권한 설정이나 그룹 관리에 사용됩니다."
  value       = "${var.project_name}-administrators"
}

# 운영자 그룹 이름을 출력합니다. 제한된 권한이 필요한 경우 이 그룹을 참조할 수 있습니다.
output "operators_group_name" {
  description = "운영자 그룹의 이름입니다. 이 값은 제한된 권한 설정이 필요할 때 사용됩니다."
  value       = "${var.project_name}-operators"
}

# 정책이 적용된 컴파트먼트 ID를 출력합니다. 다른 리소스들의 컴파트먼트 설정에 참조될 수 있습니다.
output "policy_compartment_id" {
  description = "정책이 적용된 컴파트먼트의 OCID입니다. 이 값은 리소스 생성 시 컴파트먼트 지정에 사용됩니다."
  value       = var.compartment_id
}
