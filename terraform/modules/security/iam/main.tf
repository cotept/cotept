# modules/security/iam/main.tf

# 공통으로 사용될 태그를 정의합니다.
locals {
  common_tags = {
    "Environment" = var.environment
    "Project"     = var.project_name
    "ManagedBy"   = "terraform"
    "Service"     = "mentoring"
  }
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
    "instance.compartment.id = '${var.compartment_id}'",
    "any {",
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

# 멘토링 서비스를 위한 IAM 정책을 생성합니다.
# 각 서비스 컴포넌트에 필요한 최소한의 권한만 부여합니다.
resource "oci_identity_policy" "mentoring_service" {
  compartment_id = var.compartment_id
  name           = "${var.project_name}-${var.environment}-mentoring-policy"
  description    = "Policy for mentoring service components in ${var.environment} environment"

  statements = concat(
    # 모든 서비스가 공통으로 필요로 하는 권한
    [
      "Allow dynamic-group ${oci_identity_dynamic_group.mentoring_service.name} to read secret-family in compartment id ${var.compartment_id}",
      "Allow dynamic-group ${oci_identity_dynamic_group.mentoring_service.name} to use log-content in compartment id ${var.compartment_id}"
    ],

    # API 서버를 위한 특정 권한
    [
      "Allow dynamic-group ${oci_identity_dynamic_group.mentoring_service.name} where target.tag.Service.value = 'api' to manage container-instances in compartment id ${var.compartment_id}"
    ],

    # Redis 서버를 위한 특정 권한
    [
      "Allow dynamic-group ${oci_identity_dynamic_group.mentoring_service.name} where target.tag.Service.value = 'redis' to manage redis-cluster-family in compartment id ${var.compartment_id}"
    ],

    # Coturn 서버를 위한 특정 권한
    [
      "Allow dynamic-group ${oci_identity_dynamic_group.mentoring_service.name} where target.tag.Service.value = 'coturn' to use virtual-network-family in compartment id ${var.compartment_id}",
      "Allow dynamic-group ${oci_identity_dynamic_group.mentoring_service.name} where target.tag.Service.value = 'coturn' to use network-security-groups in compartment id ${var.compartment_id}"
    ]
  )

  freeform_tags = local.common_tags
}
