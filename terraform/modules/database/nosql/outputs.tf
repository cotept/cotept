# modules/database/nosql/outputs.tf

output "realtime_communication_id" {
  description = "실시간 통신 테이블 ID"
  value       = oci_nosql_table.realtime_communication.id
}

output "user_activity_id" {
  description = "사용자 활동 테이블 ID"
  value       = oci_nosql_table.user_activity.id
}

output "system_operations_id" {
  description = "시스템 운영 테이블 ID"
  value       = oci_nosql_table.system_operations.id
}

output "table_names" {
  description = "모든 NoSQL 테이블 이름"
  value = {
    realtime_communication = oci_nosql_table.realtime_communication.name
    user_activity          = oci_nosql_table.user_activity.name
    system_operations      = oci_nosql_table.system_operations.name
  }
}
