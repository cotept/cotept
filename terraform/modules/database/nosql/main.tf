# modules/database/nosql/main.tf

locals {
  common_tags = merge(
    {
      "Environment" = var.environment
      "Project"     = var.project_name
      "ManagedBy"   = "terraform"
      "Service"     = "nosql"
    },
    var.additional_tags
  )
}

# 1. 실시간 통신 테이블 (realtime_communication)
resource "oci_nosql_table" "realtime_communication" {
  compartment_id = var.compartment_id
  name           = "${var.project_name}_${var.environment}_realtime_communication"
  
  # 무료 티어 범위 내에서 설정
  table_limits {
    max_read_units     = var.table_read_units
    max_write_units    = var.table_write_units
    max_storage_in_gbs = var.table_storage_gb
  }
  
  # 스키마 정의
  ddl_statement = <<-EOF
    CREATE TABLE IF NOT EXISTS ${var.project_name}_${var.environment}_realtime_communication (
      sessionId STRING,
      type STRING,
      timestamp STRING,
      data JSON,
      ttl TIMESTAMP(6),
      PRIMARY KEY (sessionId, type)
    )
  EOF
  
  is_auto_reclaimable = false
  
  freeform_tags = local.common_tags
}

# 2. 사용자 활동 테이블 (user_activity)
resource "oci_nosql_table" "user_activity" {
  compartment_id = var.compartment_id
  name           = "${var.project_name}_${var.environment}_user_activity"
  
  # 무료 티어 범위 내에서 설정
  table_limits {
    max_read_units     = var.table_read_units
    max_write_units    = var.table_write_units
    max_storage_in_gbs = var.table_storage_gb
  }
  
  # 스키마 정의
  ddl_statement = <<-EOF
    CREATE TABLE IF NOT EXISTS ${var.project_name}_${var.environment}_user_activity (
      userId STRING,
      type STRING,
      timestamp STRING,
      data JSON,
      ttl TIMESTAMP(6),
      PRIMARY KEY (userId, type)
    )
  EOF
  
  is_auto_reclaimable = false
  
  freeform_tags = local.common_tags
}

# 3. 시스템 운영 테이블 (system_operations)
resource "oci_nosql_table" "system_operations" {
  compartment_id = var.compartment_id
  name           = "${var.project_name}_${var.environment}_system_operations"
  
  # 무료 티어 범위 내에서 설정
  table_limits {
    max_read_units     = var.table_read_units
    max_write_units    = var.table_write_units
    max_storage_in_gbs = var.table_storage_gb
  }
  
  # 스키마 정의
  ddl_statement = <<-EOF
    CREATE TABLE IF NOT EXISTS ${var.project_name}_${var.environment}_system_operations (
      componentId STRING,
      timestamp STRING,
      type STRING,
      data JSON,
      ttl TIMESTAMP(6),
      PRIMARY KEY (componentId, timestamp)
    )
  EOF
  
  is_auto_reclaimable = false
  
  freeform_tags = local.common_tags
}

# 인덱스 생성
resource "oci_nosql_index" "realtime_communication_type_idx" {
  name              = "realtime_communication_type_idx"
  table_name_or_id  = oci_nosql_table.realtime_communication.id
  keys {
    column_name = "type"
  }
}

resource "oci_nosql_index" "user_activity_type_idx" {
  name              = "user_activity_type_idx"
  table_name_or_id  = oci_nosql_table.user_activity.id
  keys {
    column_name = "type"
  }
}

resource "oci_nosql_index" "system_operations_type_idx" {
  name              = "system_operations_type_idx"
  table_name_or_id  = oci_nosql_table.system_operations.id
  keys {
    column_name = "type"
  }
}
