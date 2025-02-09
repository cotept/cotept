# modules/compute/db/main.tf

# 기본 설정값과 공통 태그를 정의합니다.
locals {
  # PostgreSQL 15 버전의 Alpine 기반 이미지를 사용합니다.
  # Alpine 이미지는 용량이 작고 보안적으로 강화되어 있습니다.
  container_image = "postgres:15-alpine"
  
  # PostgreSQL의 데이터 디렉토리를 설정합니다.
  # 이 경로에 Block Volume이 마운트됩니다.
  mount_path     = "/var/lib/postgresql/data"
  
  # 모든 리소스에 적용될 공통 태그를 정의합니다.
  common_tags = merge(
    {
      "Environment" = var.environment
      "Project"     = var.project_name
      "ManagedBy"   = "terraform"
      "Service"     = "postgresql"
      "Role"        = "primary-database"
    },
    var.additional_tags
  )
}

# 데이터베이스 데이터를 저장할 Block Volume을 생성합니다.
# 이 볼륨은 컨테이너가 재시작되더라도 데이터를 영구적으로 보존합니다.
resource "oci_core_volume" "postgresql_data" {
  compartment_id      = var.compartment_id
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  display_name        = "${var.project_name}-${var.environment}-postgresql-data"
  size_in_gbs        = var.data_volume_size_in_gbs

  # 백업이 활성화된 경우 GOLD 정책을 적용합니다.
  # GOLD 정책은 매일 백업을 수행하고 지정된 기간 동안 보관합니다.
  backup_policy_id    = var.backup_enabled ? data.oci_core_volume_backup_policies.gold_policy.policies[0].id : null

  freeform_tags = local.common_tags
}

# 데이터베이스 초기화 스크립트를 Base64로 인코딩합니다.
# 이 스크립트는 컨테이너 첫 실행 시 자동으로 실행됩니다.
# 초기화 스크립트 처리를 위한 로컬 변수들을 정의합니다.
locals {
  # SQL 파일을 읽어옵니다.
  init_sql_template = file("${path.module}/scripts/init.sql")
  
  # 변수들을 치환합니다.
  init_sql = replace(
    replace(
      replace(
        local.init_sql_template,
        "%DB_NAME%", var.db_name
      ),
      "%DB_USER%", var.db_user
    ),
    "%DB_PASSWORD%", var.db_password
  )

  # 초기화 스크립트를 생성합니다.
  init_script = base64encode(<<-SCRIPT
    #!/bin/bash
    set -e
    
    psql -v ON_ERROR_STOP=1 --username "postgres" --dbname "postgres" <<-EOSQL
    ${local.init_sql}
    EOSQL
    SCRIPT
  )
}

# PostgreSQL 서버의 로그를 설정합니다.
# stdout과 stderr를 별도로 수집하여 문제 발생 시 빠른 원인 파악이 가능하도록 합니다.
module "postgresql_stdout_logs" {
  source = "../../logging"

  compartment_id        = var.compartment_id
  project_name          = var.project_name
  environment          = var.environment
  service_name         = "postgresql"
  container_instance_id = oci_container_instances_container_instance.postgresql.id
  log_category         = "stdout"
  tags                 = local.common_tags
}

module "postgresql_stderr_logs" {
  source = "../../logging"

  compartment_id        = var.compartment_id
  project_name          = var.project_name
  environment          = var.environment
  service_name         = "postgresql"
  container_instance_id = oci_container_instances_container_instance.postgresql.id
  log_category         = "stderr"
  tags                 = local.common_tags
}

# PostgreSQL 서버를 Container Instance로 생성합니다.
resource "oci_container_instances_container_instance" "postgresql" {
  compartment_id = var.compartment_id
  display_name   = "${var.project_name}-${var.environment}-postgresql"
  
  # Ampere A1 프리티어를 활용합니다.
  shape = "CI.Standard.A1.Flex"
  shape_config {
    ocpus         = var.cpu_count
    memory_in_gbs = var.memory_in_gbs
  }

  # Block Volume을 컨테이너에 연결합니다.
  volumes {
    name                 = "postgresql-data"
    volume_type         = "EMULATED"
    backing_type        = "BLOCK"  # Block Volume 사용
    block_volume_id     = oci_core_volume.postgresql_data.id
  }

  containers {
    display_name = "postgresql"
    image_url    = local.container_image

    # PostgreSQL의 모든 설정을 환경 변수로 전달합니다.
    environment_variables = {
      # 기본 설정
      "POSTGRES_PASSWORD"      = var.postgres_password
      "POSTGRES_DB"           = var.db_name
      "POSTGRES_INITDB_ARGS"  = "--encoding=UTF-8 --locale=C"
      "PGDATA"               = "${local.mount_path}/pgdata"
      
      # 성능 튜닝 설정
      "POSTGRES_SHARED_BUFFERS"     = "${var.shared_buffers_mb}MB"
      "POSTGRES_MAX_CONNECTIONS"    = tostring(var.max_connections)
      "POSTGRES_WORK_MEM"          = "64MB"
      "POSTGRES_MAINTENANCE_WORK_MEM" = "128MB"
      "POSTGRES_EFFECTIVE_CACHE_SIZE" = "${var.memory_in_gbs * 512}MB"  # 총 메모리의 50%
    }

    # Block Volume을 PostgreSQL 데이터 디렉토리로 마운트합니다.
    volume_mounts {
      mount_path = local.mount_path
      volume_name = "postgresql-data"
    }

    # 데이터베이스 서버의 상태를 주기적으로 확인합니다.
    health_checks {
      health_check_type = "TCP"
      port              = var.postgres_port
      interval_in_seconds = 30
      timeout_in_seconds  = 3
      retries            = 3
    }

    # PostgreSQL 서버의 주요 설정을 커맨드 라인 인자로 전달합니다.
    additional_arguments = [
      "-c", "shared_buffers=${var.shared_buffers_mb}MB",
      "-c", "max_connections=${var.max_connections}"
    ]
  }

  # 네트워크 설정 - 프라이빗 서브넷에 배치합니다.
  vnics {
    subnet_id  = var.subnet_id
    is_public_ip_assigned = false  # 보안을 위해 공개 IP는 할당하지 않습니다.
  }

  # 장애 발생 시 자동으로 복구하도록 설정합니다.
  availability_config {
    recovery_action = "RESTORE_INSTANCE"
  }

  freeform_tags = local.common_tags
}