# modules/compute/db/outputs.tf

output "instance_id" {
  description = "PostgreSQL Container Instance의 OCID입니다"
  value       = oci_container_instances_container_instance.postgresql.id
}

output "private_ip" {
  description = "PostgreSQL 서버의 프라이빗 IP 주소입니다"
  value       = oci_container_instances_container_instance.postgresql.vnics[0].private_ip
}

output "connection_info" {
  description = "데이터베이스 연결 정보입니다"
  value = {
    host          = oci_container_instances_container_instance.postgresql.vnics[0].private_ip
    port          = var.postgres_port
    database_name = var.db_name
    user          = var.db_user
  }
  sensitive = false
}

output "volume_id" {
  description = "데이터베이스 Block Volume의 OCID입니다"
  value       = oci_core_volume.postgresql_data.id
}

output "backup_policy" {
  description = "설정된 백업 정책 정보입니다"
  value       = var.backup_enabled ? "GOLD" : "DISABLED"
}

output "log_group_id" {
  description = "PostgreSQL 로그 그룹의 OCID입니다"
  value       = module.postgresql_stdout_logs.log_group_id
}