# modules/compute/coturn/main.tf

locals {
  container_image = "coturn/coturn:4.6.2-alpine"
  
  common_tags = merge(
    {
      "Environment" = var.environment
      "Project"     = var.project_name
      "ManagedBy"   = "terraform"
      "Service"     = "coturn"
      "Role"        = "webrtc-turn-server"
    },
    var.additional_tags
  )

  # Coturn 설정 파일의 내용을 생성합니다.
  coturn_config = <<-EOT
    # 기본 리스닝 포트 설정
    listening-port=3478
    tls-listening-port=5349

    # 미디어 릴레이 포트 범위 설정
    min-port=${var.turn_port_min}
    max-port=${var.turn_port_max}

    # 인증 설정
    lt-cred-mech
    user=${var.turn_user}:${var.turn_password}

    # Redis 설정
    redis-statsdb="ip=${var.redis_host} port=${var.redis_port} password=${var.redis_password} dbname=0"
    redis-userdb="ip=${var.redis_host} port=${var.redis_port} password=${var.redis_password} dbname=1"

    # 성능 및 보안 설정
    total-quota=1000
    max-bps=${var.max_bps}
    no-multicast-peers
    mobility
    no-cli

    # 로깅 설정
    verbose
    log-file=stdout
    no-stdout-log
  EOT
}

# Coturn 서버를 위한 로깅 설정
module "coturn_stdout_logs" {
  source = "../../logging"

  compartment_id        = var.compartment_id
  project_name          = var.project_name
  environment          = var.environment
  service_name         = "coturn"
  container_instance_id = oci_container_instances_container_instance.coturn.id
  log_category         = "stdout"
  tags                 = local.common_tags
}

module "coturn_stderr_logs" {
  source = "../../logging"

  compartment_id        = var.compartment_id
  project_name          = var.project_name
  environment          = var.environment
  service_name         = "coturn"
  container_instance_id = oci_container_instances_container_instance.coturn.id
  log_category         = "stderr"
  tags                 = local.common_tags
}

# Coturn 서버 Container Instance 생성
resource "oci_container_instances_container_instance" "coturn" {
  compartment_id = var.compartment_id
  display_name   = "${var.project_name}-${var.environment}-coturn"

  shape = "CI.Standard.A1.Flex"
  shape_config {
    ocpus         = var.cpu_count
    memory_in_gbs = var.memory_in_gbs
  }

  containers {
    display_name = "coturn"
    image_url    = local.container_image

    # Coturn 설정 파일을 환경 변수로 전달
    environment_variables = {
      "TURN_CONFIG" = local.coturn_config
    }

    # 상태 체크 설정
    health_checks {
      health_check_type = "TCP"
      port              = 3478  # STUN/TURN 기본 포트
      protocol          = "TCP"
      interval_in_seconds = 30
      timeout_in_seconds  = 3
      retries            = 3
    }

    # Coturn이 사용할 포트 노출
    ports {
      protocol = "TCP"
      port     = 3478  # STUN/TURN
    }
    ports {
      protocol = "UDP"
      port     = 3478
    }
    ports {
      protocol = "TCP"
      port     = 5349  # TLS
    }
    ports {
      protocol = "UDP"
      port     = 5349
    }

    # 미디어 트래픽을 위한 포트 범위 노출
    ports {
      protocol    = "UDP"
      port_range {
        min = var.turn_port_min
        max = var.turn_port_max
      }
    }

    # 컨테이너 리소스 제한 설정
    resource_config {
      memory_limit_in_gbs = var.memory_in_gbs
      vcpus_limit         = var.cpu_count
    }
  }

  # 네트워크 설정 - 퍼블릭 서브넷에 배치
  vnics {
    subnet_id  = var.subnet_id
    is_public_ip_assigned = true  # WebRTC를 위해 공개 IP 필요
  }

  # 가용성 설정
  availability_config {
    recovery_action = "RESTORE_INSTANCE"
  }

  freeform_tags = local.common_tags
}