# modules/compute/api/main.tf

# Container Instance를 위한 기본 이미지를 정의합니다.
# 우리는 NestJS 애플리케이션을 실행할 Node.js 기반 이미지를 사용할 것입니다.
locals {
  container_image = "node:18-alpine"  # 가벼운 Alpine 기반 Node.js 이미지를 사용합니다
  
  # 모든 리소스에 적용될 공통 태그를 정의합니다
  common_tags = merge(
    {
      "Environment" = var.environment
      "Project"     = var.project_name
      "ManagedBy"   = "terraform"
      "Service"     = "api"
    },
    var.additional_tags
  )
}

# API 서버의 stdout 로그를 설정합니다.
module "api_stdout_logs" {
  source = "../../logging"

  compartment_id        = var.compartment_id
  project_name          = var.project_name
  environment          = var.environment
  service_name         = "api"
  container_instance_id = oci_container_instances_container_instance.api.id
  log_category         = "stdout"
  tags                 = local.common_tags
}

# API 서버의 stderr 로그를 설정합니다.
module "api_stderr_logs" {
  source = "../../logging"

  compartment_id        = var.compartment_id
  project_name          = var.project_name
  environment          = var.environment
  service_name         = "api"
  container_instance_id = oci_container_instances_container_instance.api.id
  log_category         = "stderr"
  tags                 = local.common_tags
}

# API 서버를 위한 Container Instance를 생성합니다
resource "oci_container_instances_container_instance" "api" {
  compartment_id = var.compartment_id
  display_name   = "${var.project_name}-${var.environment}-api"
  
  # Ampere A1 프리티어를 활용하기 위한 shape 설정
  shape = "CI.Standard.A1.Flex"
  shape_config {
    ocpus         = var.cpu_count
    memory_in_gbs = var.memory_in_gbs
  }

  # 컨테이너 설정
  containers {
    display_name = "api"
    image_url    = local.container_image

    # 환경 변수 설정
    # 데이터베이스 연결 정보 등 중요 정보는 나중에 Vault에서 가져올 것입니다
    environment_variables = {
      "NODE_ENV" = var.environment
      "PORT"     = "3000"
    }

    # 상태 체크를 위한 헬스 체크 설정
    health_checks {
      health_check_type = "HTTP"
      port              = 3000
      protocol          = "TCP"
      path              = "/health"  # NestJS 헬스 체크 엔드포인트
      interval_in_seconds = 30
      timeout_in_seconds  = 3
      retries            = 3
    }

    # 리소스 제한 설정
    resource_config {
      memory_limit_in_gbs = var.memory_in_gbs
      vcpus_limit         = var.cpu_count
    }
  }

  # 네트워크 설정
  vnics {
    subnet_id  = var.subnet_id
    is_public_ip_assigned = false  # 프라이빗 서브넷에 위치하므로 공개 IP 불필요
  }

  # 가용성 설정
  availability_config {
    recovery_action = "RESTORE_INSTANCE"  # 장애 발생 시 자동 복구
  }

  freeform_tags = local.common_tags
}