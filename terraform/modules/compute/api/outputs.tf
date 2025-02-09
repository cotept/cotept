# modules/compute/api/outputs.tf

# Container Instance 관련 출력값
output "instance_id" {
  description = "API 서버 Container Instance의 OCID입니다. 로드밸런서 구성이나 모니터링 설정 시 필요합니다."
  value       = oci_container_instances_container_instance.api.id
}

output "private_ip" {
  description = "API 서버의 프라이빗 IP 주소입니다. 로드밸런서의 백엔드 설정에 사용됩니다."
  value       = oci_container_instances_container_instance.api.vnics[0].private_ip
}

# 로깅 관련 출력값
output "log_group_id" {
  description = "API 서버의 로그 그룹 OCID입니다. 모니터링 대시보드 구성이나 로그 분석 시 사용됩니다."
  value       = oci_logging_log_group.api.id
}

output "app_log_id" {
  description = "애플리케이션 로그의 OCID입니다. 로그 조회나 알림 설정 시 참조합니다."
  value       = oci_logging_log.api_app.id
}

# 컨테이너 상태 관련 출력값
output "container_health_status" {
  description = "API 컨테이너의 현재 상태입니다. 헬스 체크 모니터링에 사용됩니다."
  value       = oci_container_instances_container_instance.api.containers[0].health_status
}

output "container_start_time" {
  description = "컨테이너가 시작된 시간입니다. 가동 시간 모니터링에 활용됩니다."
  value       = oci_container_instances_container_instance.api.containers[0].start_time
}

# IAM 관련 출력값
output "logging_policy_id" {
  description = "로깅 관련 IAM 정책의 OCID입니다. 권한 관리나 감사 시 참조합니다."
  value       = oci_identity_policy.api_logging.id
}

# 리소스 메타데이터
output "resource_tags" {
  description = "API 서버 리소스에 적용된 태그들입니다. 리소스 관리와 비용 추적에 활용됩니다."
  value       = local.common_tags
}