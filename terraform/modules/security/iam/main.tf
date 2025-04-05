# modules/security/iam/main.tf

# 공통으로 사용될 태그를 정의합니다.
locals {
  common_tags = {
    "Environment" = var.environment
    "Project"     = var.project_name
    "ManagedBy"   = "terraform"
    "Service"     = var.project_name
  }
}

# 관리자 그룹 생성
resource "oci_identity_group" "administrators" {
  compartment_id = var.tenancy_ocid
  name           = "${var.project_name}-administrators"
  description    = "Administrators for ${var.project_name} project"
  
  freeform_tags = local.common_tags
}

# 기존 사용자를 관리자 그룹에 추가
resource "oci_identity_user_group_membership" "admin_user" {
  count = length(var.admin_users)
  
  group_id = oci_identity_group.administrators.id
  user_id  = var.admin_users[count.index]
}

# 컨테이너 인스턴스용 동적 그룹
resource "oci_identity_dynamic_group" "api_instances" {
  compartment_id = var.tenancy_ocid  # 동적 그룹은 테넌시 레벨에서 생성
  name           = "${var.project_name}-${var.environment}-api-instances"
  description    = "Dynamic group for API container instances"
  
  matching_rule  = "All {instance.compartment.id = '${var.compartment_id}', tag.Project.value = '${var.project_name}', tag.Component.value = 'api'}"
  
  freeform_tags = local.common_tags
}

# 멘토링 서비스 컴포넌트들을 위한 동적 그룹을 생성합니다.
# 이 그룹은 특정 태그나 속성을 가진 리소스들을 자동으로 포함합니다.
resource "oci_identity_dynamic_group" "mentoring_service" {
  compartment_id = var.tenancy_ocid # 동적 그룹은 테넌시 레벨에서 생성됩니다
  name           = "${var.project_name}-${var.environment}-mentoring-service"
  description    = "Dynamic group for mentoring service components in ${var.environment} environment"

  # 매칭 룰은 특정 서비스의 컨테이너 인스턴스만 포함하도록 제한합니다
  matching_rule = join(" ", [
    "ALL {",
    "instance.compartment.id = '${var.compartment_id}',",
    "ANY {",
    "  instance.type = 'containerinstance',",
    "  instance.tag.Service.value = 'api',",
    "  instance.tag.Service.value = 'redis',",
    "  instance.tag.Service.value = 'postgresql',",
    "  instance.tag.Service.value = 'coturn'",
    "}",
    "}"
  ])

  freeform_tags = local.common_tags
}

# 관리자 그룹을 위한 정책
resource "oci_identity_policy" "admin_policy" {
  name           = "${var.project_name}-${var.environment}-admin-policy"
  description    = "Admin policy for ${var.project_name} mentoring service"
  compartment_id = var.compartment_id

  statements = [
    "allow group ${oci_identity_group.administrators.name} to manage all-resources in compartment id ${var.compartment_id}"
  ]

  freeform_tags = local.common_tags
  
  # 그룹이 생성된 후에 정책을 생성하도록 의존성 추가
  depends_on = [oci_identity_group.administrators]
}

# Vault 시크릿 접근 정책
resource "oci_identity_policy" "api_secrets_policy" {
  name              = "${var.project_name}-${var.environment}-api-secrets-policy"
  description       = "Policy to allow API container instances to read secrets"
  compartment_id    = var.compartment_id
  
  statements = [
    "allow dynamic-group ${oci_identity_dynamic_group.api_instances.name} to read secret-bundles in compartment id ${var.compartment_id}"
  ]
  
  freeform_tags = local.common_tags
}

# Object Storage 서비스 주체에 대한 정책
resource "oci_identity_policy" "object_storage_service_policy" {
  name           = "${var.project_name}-${var.environment}-os-service-policy"
  description    = "Policy for Object Storage service principal"
  compartment_id = var.compartment_id

  statements = [
    "allow service objectstorage-${var.region} to manage object-family in compartment id ${var.compartment_id}",
    "allow service objectstorage-${var.region} to manage buckets in compartment id ${var.compartment_id}"
  ]

  freeform_tags = local.common_tags
}
