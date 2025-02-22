# modules/compute/redis/outputs.tf

# Redis 서버의 기본 정보를 출력합니다.
output "instance_id" {
  description = "Redis Container Instance의 OCID입니다."
  value       = oci_container_instances_container_instance.redis.id
}

output "private_ip" {
  description = "Redis 서버의 프라이빗 IP 주소입니다. API 서버에서 이 주소로 연결합니다."
  value       = oci_container_instances_container_instance.redis.vnics[0].private_ip
}

# Redis 연결 정보를 출력합니다.
output "connection_info" {
  description = "Redis 연결에 필요한 정보입니다."
  value = {
    host = oci_container_instances_container_instance.redis.vnics[0].private_ip
    port = var.redis_port
  }
  sensitive = false # 호스트와 포트는 민감 정보가 아님
}

# 로깅 관련 정보를 출력합니다.
output "log_group_id" {
  description = "Redis 로그 그룹의 OCID입니다."
  value       = module.redis_stdout_logs.log_group_id
}

# 상태 정보를 출력합니다.
output "container_health_status" {
  description = "Redis 컨테이너의 현재 상태입니다."
  value       = oci_container_instances_container_instance.redis.containers[0].health_status
}
