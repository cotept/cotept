# modules/compute/redis/main.tf

# 이 모듈은 세션 관리를 위한 Redis 서버를 Container Instance로 구성합니다.
# Redis는 프라이빗 서브넷에 위치하며, API 서버와 안전하게 통신합니다.

locals {
  # 기본 이미지로 Redis Alpine 버전을 사용합니다.
  # Alpine 기반 이미지는 가볍고 보안적으로 안전합니다.
  container_image = "redis:7-alpine"

  # 모든 리소스에 적용될 공통 태그를 정의합니다.
  common_tags = merge(
    {
      "Environment" = var.environment
      "Project"     = var.project_name
      "ManagedBy"   = "terraform"
      "Service"     = "redis"
      "Role"        = "session-store"
    },
    var.additional_tags
  )
}

# Redis 서버의 로그를 위한 통합 로깅 설정
module "redis_stdout_logs" {
  source = "../../logging"

  compartment_id        = var.compartment_id
  project_name          = var.project_name
  environment           = var.environment
  service_name          = "redis"
  container_instance_id = oci_container_instances_container_instance.redis.id
  log_category          = "stdout"
  tags                  = local.common_tags
}

module "redis_stderr_logs" {
  source = "../../logging"

  compartment_id        = var.compartment_id
  project_name          = var.project_name
  environment           = var.environment
  service_name          = "redis"
  container_instance_id = oci_container_instances_container_instance.redis.id
  log_category          = "stderr"
  tags                  = local.common_tags
}

# Redis 서버를 위한 Container Instance를 생성합니다.
resource "oci_container_instances_container_instance" "redis" {
  compartment_id = var.compartment_id
  display_name   = "${var.project_name}-${var.environment}-redis"

  # 가용성 영역 설정 추가
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name

  # Ampere A1 프리티어를 활용합니다.
  shape = "CI.Standard.A1.Flex"
  shape_config {
    ocpus         = var.cpu_count
    memory_in_gbs = var.memory_in_gbs
  }

  # Redis 컨테이너 설정
  containers {
    display_name = "redis"
    image_url    = local.container_image

    # Redis 서버 설정을 환경 변수로 전달합니다.
    environment_variables = {
      "REDIS_PASSWORD"         = var.vault_secrets.redis.content
      "REDIS_PORT"             = tostring(var.redis_port)
      "REDIS_MAXMEMORY"        = "${var.maxmemory_mb}mb"
      "REDIS_MAXMEMORY_POLICY" = "volatile-lru"
      "REDIS_TIMEOUT"          = "300"
      "REDIS_TCP_KEEPALIVE"    = "60"
      "REDIS_APPENDONLY"       = "yes"
      "REDIS_SAVE"             = "900 1"
    }

    # Redis 서버의 상태를 주기적으로 체크합니다.
    health_checks {
      health_check_type   = "TCP"
      port                = var.redis_port
      interval_in_seconds = 30
      timeout_in_seconds  = 3
    }

    # 컨테이너 리소스 제한 설정
    resource_config {
      memory_limit_in_gbs = var.memory_in_gbs
      vcpus_limit         = var.cpu_count
    }

    # Redis 설정을 위한 커맨드 오버라이드
    command = [
      "redis-server",
      "--requirepass", var.vault_secrets.redis.content,
      "--port", "${var.redis_port}",
      "--maxmemory", "${var.maxmemory_mb}mb",
      "--maxmemory-policy", "volatile-lru",
      "--appendonly", "yes"
    ]
  }

  # 네트워크 설정
  vnics {
    subnet_id             = var.subnet_id
    is_public_ip_assigned = false
  }

  freeform_tags = local.common_tags
}

# 가용성 영역 데이터 소스
data "oci_identity_availability_domains" "ads" {
  compartment_id = var.compartment_id
}
