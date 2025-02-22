# modules/logging/outputs.tf

output "log_group_id" {
  description = "생성된 통합 로그 그룹의 OCID입니다"
  value       = oci_logging_log_group.unified.id
}

output "log_group_name" {
  description = "생성된 통합 로그 그룹의 표시 이름입니다"
  value       = oci_logging_log_group.unified.display_name
}

output "service_log_id" {
  description = "생성된 서비스 로그 스트림의 OCID입니다"
  value       = oci_logging_log.service_logs.id
}

output "service_log_name" {
  description = "생성된 서비스 로그 스트림의 표시 이름입니다"
  value       = oci_logging_log.service_logs.display_name
}

output "log_path" {
  description = "로그 검색에 사용할 수 있는 전체 경로입니다"
  value       = "${oci_logging_log_group.unified.display_name}/${oci_logging_log.service_logs.display_name}"
}

output "retention_duration" {
  description = "설정된 로그 보존 기간(일)입니다"
  value       = oci_logging_log.service_logs.retention_duration
}
