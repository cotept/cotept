# modules/compute/db/outputs.tf

# 데이터베이스 인스턴스 정보
output "instance_id" {
  description = "PostgreSQL Container Instance의 OCID입니다. 모니터링과 관리에 사용됩니다"
  value       = oci_container_instances_container_instance.postgresql.id
}

output "private_ip" {
  description = "PostgreSQL 서버의 프라이빗 IP 주소입니다. API 서버에서 이 주소로 연결합니다"
  value       = oci_container_instances_container_instance.postgresql.vnics[0].private_ip
}

# 데이터베이스 연결 정보
output "connection_info" {
  description = "애플리케이션의 데이터베이스 연결에 필요한 정보입니다"
  value = {
    host            = oci_container_instances_container_instance.postgresql.vnics[0].private_ip
    port            = 5432
    database_name   = var.db_name
    user            = var.db_user
    max_connections = var.max_connections
    pool_config = {
      min_connections = 5     # 연결 풀의 최소 유지 연결 수
      max_connections = 20    # API 서버의 최대 연결 수
      idle_timeout    = 10000 # 유휴 연결 타임아웃 (10초)
      acquire_timeout = 30000 # 새 연결 획득 타임아웃 (30초)
    }
  }
  sensitive = false # 연결 설정은 민감 정보가 아닙니다
}

# 스토리지 정보
output "volume_id" {
  description = "데이터베이스 Block Volume의 OCID입니다. 백업과 모니터링에 사용됩니다"
  value       = oci_core_volume.postgresql_data.id
}

output "volume_size" {
  description = "할당된 Block Volume의 크기(GB)입니다"
  value       = var.data_volume_size_in_gbs
}

# 성능 설정 정보
output "performance_config" {
  description = "데이터베이스의 주요 성능 설정입니다. 모니터링과 튜닝에 참고됩니다"
  value = {
    cpu_count            = var.cpu_count
    memory_in_gbs        = var.memory_in_gbs
    shared_buffers       = "${var.shared_buffers_mb}MB"
    max_connections      = var.max_connections
    reserved_connections = 3 # 관리자용 예약 연결
    work_mem             = "32MB"
    maintenance_work_mem = "128MB"
  }
}

# 로깅 정보
output "log_group_id" {
  description = "PostgreSQL 로그 그룹의 OCID입니다. 로그 조회와 알림 설정에 사용됩니다"
  value       = module.postgresql_stdout_logs.log_group_id
}

# 데이터베이스 상태 정보
output "container_health_status" {
  description = "PostgreSQL 컨테이너의 현재 상태입니다. 헬스 체크 결과를 반영합니다"
  value       = oci_container_instances_container_instance.postgresql.containers[0].health_status
}

# TypeORM 설정 예시
output "typeorm_config_example" {
  description = "TypeORM에서 사용할 수 있는 설정 예시입니다"
  value = {
    type : "postgres"
    host : oci_container_instances_container_instance.postgresql.vnics[0].private_ip
    port : 5432
    username : var.db_user
    database : var.db_name
    pool : {
      min : 5
      max : 20
      idle : 10000
      acquire : 30000
    }
    extra : {
      statement_timeout : 30000            # 쿼리 타임아웃 30초
      idle_in_transaction_timeout : 300000 # 트랜잭션 타임아웃 5분
    }
  }
}
