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

# 멘토링 서비스를 위한 IAM 정책을 생성합니다.
# # 각 서비스 컴포넌트에 필요한 최소한의 권한만 부여합니다.
# resource "oci_identity_policy" "mentoring_service" {
#   name           = "${var.project_name}-${var.environment}-policy"
#   description    = "Policy for ${var.project_name}-${var.environment} service"
#   compartment_id = var.compartment_id

#   statements = [
#     # 네트워크 관련 권한
#     # NetworkAdmins 권한
#     # "allow group NetworkAdmins to manage load-balancers in compartment ${var.project_name}-${var.environment}",
#     # "allow group NetworkAdmins to use virtual-network-family in compartment ${var.project_name}-${var.environment}",
#     # "allow group NetworkAdmins to manage instances in compartment ${var.project_name}-${var.environment}",
#     # 서비스 권한
#     # "allow service LBService to use virtual-network-family in compartment ${var.project_name}-${var.environment}",
#     # "allow service blockstorage to use virtussal-network-family in compartment ${var.project_name}-${var.environment}",

#     # # VCN 관리 권한
#     # "allow group ${var.project_name}-administrators to manage virtual-network-family in compartment ${var.project_name}-${var.environment}",
#     # "allow group ${var.project_name}-operators to read virtual-network-family in compartment ${var.project_name}-${var.environment}",

#     # # 보안 목록 관리
#     # "allow group ${var.project_name}-administrators to manage security-lists in compartment ${var.project_name}-${var.environment}",
#     # "allow group ${var.project_name}-operators to read security-lists in compartment ${var.project_name}-${var.environment}",

#     # # 인터넷 및 NAT 게이트웨이 관리
#     # "allow group ${var.project_name}-administrators to manage internet-gateways in compartment ${var.project_name}-${var.environment}",
#     # "allow group ${var.project_name}-administrators to manage nat-gateways in compartment ${var.project_name}-${var.environment}",

#     # # 서비스 게이트웨이 관리
#     # "allow group ${var.project_name}-administrators to manage service-gateways in compartment ${var.project_name}-${var.environment}",

#     # # NSG(Network Security Groups) 관리
#     # "allow group ${var.project_name}-administrators to manage network-security-groups in compartment ${var.project_name}-${var.environment}",

#     # # Container Instance 기본 권한
#     # "allow group ${var.project_name}-administrators to manage container-instances in compartment ${var.project_name}-${var.environment}",
#     # "allow group ${var.project_name}-operators to read container-instances in compartment ${var.project_name}-${var.environment}",

#     # # Container Instance 관련 서비스 권한
#     # "allow service container-instance to use virtual-network-family in compartment ${var.project_name}-${var.environment}",
#     # "allow service container-instance to use log-content in compartment ${var.project_name}-${var.environment}",

#     # # Container Registry 관련 권한
#     # "allow group ${var.project_name}-administrators to manage repos in compartment ${var.project_name}-${var.environment}",
#     # "allow service container-instance to read repos in compartment ${var.project_name}-${var.environment}",

#     # # Vault & Secrets 접근 권한
#     # "allow service container-instance to read secret-family in compartment ${var.project_name}-${var.environment}",
#     # "allow service container-instance to use vaults in compartment ${var.project_name}-${var.environment}",
#     # "allow group ${var.project_name}-administrators to manage vaults in compartment ${var.project_name}-${var.environment}",
#     # "allow group ${var.project_name}-administrators to manage keys in compartment ${var.project_name}-${var.environment}",
#     # "allow group ${var.project_name}-administrators to manage secret-family in compartment ${var.project_name}-${var.environment}",

#     # # 스토리지 관련 권한
#     # "allow service container-instance to use volume-family in compartment ${var.project_name}-${var.environment}",
#     # "allow group ${var.project_name}-administrators to manage object-family in compartment ${var.project_name}-${var.environment}",
#     # "allow group ${var.project_name}-administrators to manage volume-family in compartment ${var.project_name}-${var.environment}",
#     # "allow group ${var.project_name}-administrators to manage file-family in compartment ${var.project_name}-${var.environment}",

#     # # 로깅 관련 권한
#     # "allow group ${var.project_name}-administrators to manage logging-family in compartment ${var.project_name}-${var.environment}",
#     # "allow group ${var.project_name}-administrators to manage log-groups in compartment ${var.project_name}-${var.environment}",
#     # "allow service logging to use log-content in compartment ${var.project_name}-${var.environment}",

#     # # 모니터링 관련 권한
#     # "allow group ${var.project_name}-administrators to manage metrics in compartment ${var.project_name}-${var.environment}",
#     # "allow group ${var.project_name}-administrators to manage alarms in compartment ${var.project_name}-${var.environment}",
#     # "allow service monitoring to read metrics in compartment ${var.project_name}-${var.environment}",

#     # # WAF 관련 권한
#     # "allow group ${var.project_name}-administrators to manage waas-family in compartment ${var.project_name}-${var.environment}",
#     # "allow service waf to use virtual-network-family in compartment ${var.project_name}-${var.environment}",

#     # # DNS 관련 권한
#     # "allow group ${var.project_name}-administrators to manage dns in compartment ${var.project_name}-${var.environment}",
#     # "allow group ${var.project_name}-administrators to manage zones in compartment ${var.project_name}-${var.environment}",

#     # # 인증서 관련 권한
#     # "allow group ${var.project_name}-administrators to manage certificates in compartment ${var.project_name}-${var.environment}",
#     # "allow group ${var.project_name}-administrators to manage certificate-authorities in compartment ${var.project_name}-${var.environment}",

#     # # 태그 관리 권한
#     # "allow group ${var.project_name}-administrators to manage tag-namespaces in compartment ${var.project_name}-${var.environment}",
#     # "allow group ${var.project_name}-administrators to manage tag-defaults in compartment ${var.project_name}-${var.environment}",

#     # # 비용 추적 권한
#     # "allow group ${var.project_name}-administrators to read usage-budgets in compartment ${var.project_name}-${var.environment}",
#     # "allow group ${var.project_name}-administrators to read usage-reports in compartment ${var.project_name}-${var.environment}"

#     # Admin 전체 권한
#     "allow group ${var.project_name}-administrators to manage all-resources in compartment ${var.project_name}-${var.environment}",
#     # Load Balancer 관련 권한
#     "allow service idcs to use load-balancer-family in compartment ${var.project_name}-${var.environment}",

#     # Container Instance 관련 권한
#     "allow service container-instance to use virtual-network-family in compartment ${var.project_name}-${var.environment}",
#     "allow service container-instance to read repos in compartment ${var.project_name}-${var.environment}",
#     "allow service container-instance to read secret-family in compartment ${var.project_name}-${var.environment}",
#     "allow service container-instance to use vaults in compartment ${var.project_name}-${var.environment}",

#     # Logging & Monitoring 권한
#     "allow service logging to use log-content in compartment ${var.project_name}-${var.environment}",
#     "allow service monitoring to read metrics in compartment ${var.project_name}-${var.environment}"

#   ]

#   freeform_tags = local.common_tags
# }


# 관리자 그룹을 위한 정책
resource "oci_identity_policy" "admin_policy" {
  name           = "${var.project_name}-${var.environment}-admin-policy"
  description    = "Admin policy for Cotept mentoring service"
  compartment_id = var.compartment_id

  statements = [
    "allow group ${var.project_name}-administrators to manage all-resources in compartment ${var.project_name}-${var.environment}"
  ]

  freeform_tags = local.common_tags
}

# # 서비스 접근을 위한 정책
# resource "oci_identity_policy" "service_policy" {
#   name           = "${var.project_name}-${var.environment}-service-policy"
#   description    = "Service policy for Cotept mentoring service"
#   compartment_id = var.compartment_id

#   statements = [
#     "allow any-user to use load-balancer-family in compartment ${var.project_name}-${var.environment} where request.principal.type = 'service'",
#     "allow any-user to use virtual-network-family in compartment ${var.project_name}-${var.environment} where request.principal.type = 'service'"
#   ]

#   freeform_tags = local.common_tags
# }
