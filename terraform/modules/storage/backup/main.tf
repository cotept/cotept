# modules/storage/main.tf

# Get the Object Storage namespace
data "oci_objectstorage_namespace" "ns" {
  compartment_id = var.compartment_id
}

# 기본 버킷 생성
resource "oci_objectstorage_bucket" "bucket" {
  compartment_id = var.compartment_id
  name           = var.bucket_name
  namespace      = data.oci_objectstorage_namespace.ns.namespace
  access_type    = var.bucket_access_type
  versioning     = var.versioning
  storage_tier   = var.storage_tier

  # 객체 이벤트 활성화 (선택적)
  object_events_enabled = var.object_events_enabled

  # KMS 암호화 설정 (선택적)
  kms_key_id = var.kms_key_id != "" ? var.kms_key_id : null

  # 메타데이터 설정
  metadata = {
    "created_by"  = "terraform"
    "environment" = var.environment
  }

  # 태그 설정
  freeform_tags = merge(
    {
      "Environment" = var.environment
      "Project"     = var.project_name
      "ManagedBy"   = "terraform"
      "Service"     = "object-storage"
    },
    var.additional_tags
  )
}

# CORS 규칙 설정 - OCI CLI 사용
resource "null_resource" "bucket_cors" {
  count = length(var.cors_rules) > 0 ? 1 : 0

  triggers = {
    bucket_id = oci_objectstorage_bucket.bucket.id
    cors_json = jsonencode(var.cors_rules)
  }

  provisioner "local-exec" {
    command     = <<-EOT
      # CORS 규칙을 JSON 파일로 저장
      cat > /tmp/cors_rules.json << 'EOF'
      {
        "cors_rules": ${jsonencode(var.cors_rules)}
      }
      EOF
      
      # OCI CLI로 CORS 설정
      oci os bucket update \
        --namespace ${data.oci_objectstorage_namespace.ns.namespace} \
        --name ${oci_objectstorage_bucket.bucket.name} \
        --from-json file:///tmp/cors_rules.json
    EOT
    interpreter = ["/bin/bash", "-c"]
  }

  depends_on = [oci_objectstorage_bucket.bucket]
}

# 라이프사이클 정책 설정
resource "oci_objectstorage_object_lifecycle_policy" "bucket_lifecycle_policy" {
  count = length(var.lifecycle_rules) > 0 ? 1 : 0

  bucket    = oci_objectstorage_bucket.bucket.name
  namespace = data.oci_objectstorage_namespace.ns.namespace

  dynamic "rules" {
    for_each = var.lifecycle_rules
    content {
      is_enabled = true
      name       = rules.value.name
      target     = rules.value.target # "objects" 또는 "multipart-uploads"
      action     = rules.value.action # "DELETE" 또는 "ARCHIVE"

      time_amount = rules.value.time_amount
      time_unit   = rules.value.time_unit # "DAYS"

    }
  }
}

# 폴더 구조 초기화 (선택적)
resource "oci_objectstorage_object" "folder_structure" {
  for_each = var.create_folder_structure ? toset(var.initial_folders) : []

  bucket    = oci_objectstorage_bucket.bucket.name
  namespace = data.oci_objectstorage_namespace.ns.namespace
  object    = "${each.key}/"
  content   = "" # 빈 내용으로 폴더 표시
}

# 프리사인된 URL 생성을 위한 PAR(Pre-authenticated Request) 관리 (선택적)
resource "oci_objectstorage_preauthrequest" "upload_par" {
  count = var.create_upload_par ? 1 : 0

  access_type  = "AnyObjectWrite" # 버킷에 객체 업로드 허용
  bucket       = oci_objectstorage_bucket.bucket.name
  namespace    = data.oci_objectstorage_namespace.ns.namespace
  name         = "${var.bucket_name}-upload-par"
  time_expires = timeadd(timestamp(), "${var.par_expiry_time}h")
}

resource "oci_objectstorage_preauthrequest" "download_par" {
  count = var.create_download_par ? 1 : 0

  access_type  = "AnyObjectRead" # 버킷의 모든 객체 읽기 허용
  bucket       = oci_objectstorage_bucket.bucket.name
  namespace    = data.oci_objectstorage_namespace.ns.namespace
  name         = "${var.bucket_name}-download-par"
  time_expires = timeadd(timestamp(), "${var.par_expiry_time}h")
}

# 복제 정책 설정 (선택적)
resource "oci_objectstorage_replication_policy" "bucket_replication_policy" {
  count = var.replication_enabled && var.destination_bucket_name != "" ? 1 : 0

  bucket    = oci_objectstorage_bucket.bucket.name
  namespace = data.oci_objectstorage_namespace.ns.namespace

  name = "${var.bucket_name}-replication"

  destination_bucket_name = var.destination_bucket_name
  destination_region_name = var.destination_region_name
}

# 알림 설정 - OCI CLI 사용
resource "null_resource" "bucket_notification" {
  count = var.notification_enabled && var.notification_topic_id != "" ? 1 : 0

  triggers = {
    bucket_id = oci_objectstorage_bucket.bucket.id
    topic_id  = var.notification_topic_id
  }

  provisioner "local-exec" {
    command     = <<-EOT
      oci os bucket update \
        --namespace ${data.oci_objectstorage_namespace.ns.namespace} \
        --name ${oci_objectstorage_bucket.bucket.name} \
        --notification-topic-id ${var.notification_topic_id} \
        --notification-events ${join(" ", var.notification_events)} \
        --no-verify-ssl
    EOT
    interpreter = ["/bin/bash", "-c"]
  }

  depends_on = [oci_objectstorage_bucket.bucket]
}

# 대역폭 제한 정책 - OCI CLI 사용
resource "null_resource" "bucket_rate_limit" {
  count = var.create_rate_limit ? 1 : 0

  triggers = {
    bucket_id        = oci_objectstorage_bucket.bucket.id
    rate_limit_value = var.rate_limit_per_client
  }

  provisioner "local-exec" {
    command     = <<-EOT
      oci os bucket update \
        --namespace ${data.oci_objectstorage_namespace.ns.namespace} \
        --name ${oci_objectstorage_bucket.bucket.name} \
        --rate-limit ${var.rate_limit_per_client} \
        --no-verify-ssl
    EOT
    interpreter = ["/bin/bash", "-c"]
  }

  depends_on = [oci_objectstorage_bucket.bucket]
}