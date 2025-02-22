# modules/compute/db/main.tf
data "oci_identity_availability_domains" "ads" {
  compartment_id = var.compartment_id
}
# 기본 설정값과 공통 태그를 정의합니다.
locals {
  # PostgreSQL 15 버전의 Alpine 기반 이미지를 사용합니다.
  # Alpine 이미지는 용량이 작고 보안적으로 강화되어 있습니다.
  container_image = "postgres:15-alpine"

  # PostgreSQL의 데이터 디렉토리를 설정합니다.
  # 이 경로에 Block Volume이 마운트됩니다.
  mount_path = "/var/lib/postgresql/data"

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

  # 데이터베이스 초기화 스크립트 설정
  init_sql_template = file("${path.module}/scripts/init.sql")

  # SQL 스크립트의 변수들을 실제 값으로 대체합니다.
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

  # 초기화 스크립트를 실행 가능한 형태로 변환합니다.
  init_script = base64encode(<<-EOF
    #!/bin/bash
    set -e
    
    psql -v ON_ERROR_STOP=1 --username "postgres" --dbname "postgres" <<-EOSQL
    ${local.init_sql}
    EOSQL
    EOF
  )
}


# 데이터베이스 데이터를 저장할 Block Volume을 생성합니다.
# PostgreSQL 서버의 로그를 설정합니다.
# stdout과 stderr를 별도로 수집하여 문제 발생 시 빠른 원인 파악이 가능하도록 합니다.
# Block Volume을 생성합니다. 데이터베이스 파일을 영구적으로 저장하는 공간입니다.
resource "oci_core_volume" "postgresql_data" {
  compartment_id      = var.compartment_id
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  display_name        = "${var.project_name}-${var.environment}-postgresql-data"
  size_in_gbs         = var.data_volume_size_in_gbs

  freeform_tags = local.common_tags
}

# PostgreSQL 서버의 로그를 설정합니다.
module "postgresql_stdout_logs" {
  source = "../../logging"

  compartment_id        = var.compartment_id
  project_name          = var.project_name
  environment           = var.environment
  service_name          = "postgresql"
  container_instance_id = oci_container_instances_container_instance.postgresql.id
  log_category          = "stdout"
  tags                  = local.common_tags
}

module "postgresql_stderr_logs" {
  source = "../../logging"

  compartment_id        = var.compartment_id
  project_name          = var.project_name
  environment           = var.environment
  service_name          = "postgresql"
  container_instance_id = oci_container_instances_container_instance.postgresql.id
  log_category          = "stderr"
  tags                  = local.common_tags
}

# PostgreSQL Container Instance를 생성합니다.
resource "oci_container_instances_container_instance" "postgresql" {
  compartment_id      = var.compartment_id
  display_name        = "${var.project_name}-${var.environment}-postgresql"
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name

  # 1코어, 6GB 메모리로 설정합니다.
  shape = "CI.Standard.A1.Flex"
  shape_config {
    ocpus         = var.cpu_count
    memory_in_gbs = var.memory_in_gbs
  }

  # Block Volume을 컨테이너에 연결합니다.
  volumes {
    name        = "postgresql-data"
    volume_type = "BLOCK_VOLUME"
  }

  containers {
    display_name = "postgresql"
    image_url    = local.container_image

    # PostgreSQL의 주요 설정을 환경 변수로 전달합니다.
    environment_variables = {
      # 기본 인증 설정
      "POSTGRES_PASSWORD"    = var.postgres_password # vault 모듈에서 전달받은 값
      "POSTGRES_DB"          = var.db_name
      "POSTGRES_INITDB_ARGS" = "--encoding=UTF-8 --locale=C"
      "PGDATA"               = "${local.mount_path}/pgdata"

      # 연결 및 리소스 설정
      "POSTGRES_MAX_CONNECTIONS"                = tostring(var.max_connections) # 총 50개 연결
      "POSTGRES_SUPERUSER_RESERVED_CONNECTIONS" = "3"                           # 관리자용 연결 예약

      # 메모리 설정
      "POSTGRES_SHARED_BUFFERS"       = "${var.shared_buffers_mb}MB" # 1.5GB
      "POSTGRES_WORK_MEM"             = "32MB"                       # 개별 쿼리 작업공간
      "POSTGRES_MAINTENANCE_WORK_MEM" = "128MB"                      # 유지보수 작업용
      "POSTGRES_EFFECTIVE_CACHE_SIZE" = "4GB"                        # OS 캐시 포함 예상 크기

      # 백그라운드 작업자 설정
      "POSTGRES_MAX_WORKER_PROCESSES" = "4" # 총 작업자 프로세스 수
      "POSTGRES_MAX_PARALLEL_WORKERS" = "1" # 병렬 처리 제한

      # 타임아웃 설정
      "POSTGRES_IDLE_IN_TRANSACTION_SESSION_TIMEOUT" = "300000" # 5분
      "POSTGRES_STATEMENT_TIMEOUT"                   = "30000"  # 30초

      # 초기화 스크립트 설정
      "POSTGRES_INITDB_WALDIR" = "${local.mount_path}/pg_wal"
      "POSTGRES_INIT_SCRIPT"   = local.init_script
    }

    # Block Volume을 마운트합니다.
    volume_mounts {
      mount_path  = local.mount_path
      volume_name = "postgresql-data"
    }

    # 데이터베이스 상태를 주기적으로 체크합니다.
    health_checks {
      health_check_type   = "TCP"
      port                = 5432
      interval_in_seconds = 30
      timeout_in_seconds  = 3
    }

    # 컨테이너 리소스 제한을 설정합니다.
    resource_config {
      memory_limit_in_gbs = var.memory_in_gbs
      vcpus_limit         = var.cpu_count
    }
  }

  # 프라이빗 서브넷에 배치합니다.
  vnics {
    subnet_id             = var.subnet_id
    is_public_ip_assigned = false
  }

  freeform_tags = local.common_tags
}
