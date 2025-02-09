# modules/logging/main.tf

# 모든 서비스를 위한 단일 통합 로그 그룹을 생성합니다.
# 이 로그 그룹은 프로젝트의 모든 로그를 중앙 집중적으로 관리합니다.
resource "oci_logging_log_group" "unified" {
  compartment_id = var.compartment_id
  display_name   = "${var.project_name}-${var.environment}-unified-logs"
  description    = "Unified logging group for all services in ${var.project_name} ${var.environment} environment"

  freeform_tags = merge(var.tags, {
    "LoggingType" = "Unified"
    "Environment" = var.environment
    "Project"     = var.project_name
  })
}

# 각 서비스와 로그 카테고리(stdout/stderr)에 대한 로그 스트림을 생성합니다.
# 이 로그 스트림은 특정 서비스의 로그를 수집하고 관리합니다.
resource "oci_logging_log" "service_logs" {
  display_name = "${var.project_name}-${var.environment}-${var.service_name}-${var.log_category}"
  log_group_id = oci_logging_log_group.unified.id
  log_type     = "SERVICE"

  configuration {
    source {
      category    = var.log_category
      resource    = var.container_instance_id
      service     = "container_instances"
      source_type = "OCISERVICE"
    }

    # 환경에 따른 로그 레벨을 설정합니다.
    # 운영 환경에서는 중요 로그만, 개발 환경에서는 상세 로그를 수집합니다.
    parameters {
      name  = "minimumLevel"
      value = var.environment == "prod" ? "INFO" : "DEBUG"
    }

    # JSON 형식의 로그를 파싱하기 위한 설정입니다.
    parser {
      parser_type    = "JSON"
      field_time_key = "timestamp"
      types {
        service = "string"
        level   = "string"
        environment = "string"
      }
    }
  }

  # 환경에 따른 로그 보존 기간을 설정합니다.
  retention_duration = var.environment == "prod" ? "90" : "30"

  freeform_tags = merge(var.tags, {
    "Service"     = var.service_name
    "LogCategory" = var.log_category
    "Environment" = var.environment
  })
}