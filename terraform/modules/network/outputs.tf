# modules/network/outputs.tf

# VCN 관련 출력값
output "vcn_id" {
  description = "생성된 VCN의 OCID"
  value       = oci_core_vcn.main.id
}

output "vcn_cidr" {
  description = "VCN의 CIDR 블록"
  value       = var.vcn_cidr
}

# 서브넷 관련 출력값
output "public_subnet_id" {
  description = "퍼블릭 서브넷(로드밸런서, Coturn)의 OCID"
  value       = oci_core_subnet.public_lb.id
}

output "private_app_subnet_id" {
  description = "프라이빗 애플리케이션 서브넷의 OCID"
  value       = oci_core_subnet.private_app.id
}

output "private_database_subnet_id" {
  description = "프라이빗 데이터베이스 서브넷의 OCID"
  value       = oci_core_subnet.private_database.id
}

# 보안 리스트 관련 출력값
output "public_security_list_id" {
  description = "퍼블릭 서브넷의 보안 리스트 OCID"
  value       = oci_core_security_list.public.id
}

output "private_app_security_list_id" {
  description = "프라이빗 애플리케이션 서브넷의 보안 리스트 OCID"
  value       = oci_core_security_list.private_app.id
}

output "private_database_security_list_id" {
  description = "프라이빗 데이터베이스 서브넷의 보안 리스트 OCID"
  value       = oci_core_security_list.private_database.id
}

# 게이트웨이 관련 출력값
output "internet_gateway_id" {
  description = "인터넷 게이트웨이의 OCID"
  value       = oci_core_internet_gateway.main.id
}

output "nat_gateway_id" {
  description = "NAT 게이트웨이의 OCID"
  value       = var.enable_nat_gateway ? oci_core_nat_gateway.main[0].id : null
}

output "service_gateway_id" {
  description = "서비스 게이트웨이의 OCID"
  value       = var.enable_service_gateway ? oci_core_service_gateway.main[0].id : null
}

# 라우트 테이블 관련 출력값
output "public_route_table_id" {
  description = "퍼블릭 서브넷의 라우트 테이블 OCID"
  value       = oci_core_route_table.public.id
}

output "private_route_table_id" {
  description = "프라이빗 서브넷의 라우트 테이블 OCID"
  value       = oci_core_route_table.private.id
}

# 추가적인 네트워크 정보
output "vcn_domain_name" {
  description = "VCN의 DNS 도메인 이름"
  value       = oci_core_vcn.main.vcn_domain_name
}

output "subnet_cidr_blocks" {
  description = "각 서브넷의 CIDR 블록 정보"
  value = {
    public      = var.public_subnet_cidr
    private_app = var.private_app_subnet_cidr
    private_db  = var.private_database_subnet_cidr
  }
}

output "coturn_security_group_id" {
  description = "Coturn 서버의 보안 그룹 OCID입니다"
  value       = oci_core_network_security_group.coturn.id
}
