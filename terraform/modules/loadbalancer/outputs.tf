# modules/network/loadbalancer/outputs.tf

# 로드밸런서 기본 정보
output "load_balancer_id" {
  description = "생성된 로드밸런서의 OCID입니다"
  value       = oci_load_balancer.api_lb.id
}

output "load_balancer_ip" {
  description = "로드밸런서의 공인 IP 주소입니다"
  value       = oci_load_balancer.api_lb.ip_address_details[0].ip_address
}

output "load_balancer_name" {
  description = "로드밸런서의 표시 이름입니다"
  value       = oci_load_balancer.api_lb.display_name
}

# 백엔드 세트 정보
output "backend_set_name" {
  description = "API 서버 백엔드 세트의 이름입니다"
  value       = oci_load_balancer_backend_set.api_backend_set.name
}

# 리스너 정보
output "https_listener_name" {
  description = "HTTPS 리스너의 이름입니다"
  value       = oci_load_balancer_listener.https_listener.name
}

output "websocket_listener_name" {
  description = "WebSocket 리스너의 이름입니다"
  value       = oci_load_balancer_listener.websocket_listener.name
}

# 엔드포인트 정보
output "https_endpoint" {
  description = "HTTPS 엔드포인트 URL입니다"
  value       = "https://${oci_load_balancer.api_lb.ip_address_details[0].ip_address}"
}

output "websocket_endpoint" {
  description = "WebSocket 엔드포인트 URL입니다"
  value       = "wss://${oci_load_balancer.api_lb.ip_address_details[0].ip_address}:8080"
}

# 상태 및 설정 정보
output "shape_details" {
  description = "로드밸런서의 shape 설정 정보입니다"
  value = {
    shape                     = oci_load_balancer.api_lb.shape
    minimum_bandwidth_in_mbps = var.load_balancer_shape_details.minimum_bandwidth_in_mbps
    maximum_bandwidth_in_mbps = var.load_balancer_shape_details.maximum_bandwidth_in_mbps
  }
}

output "certificate_name" {
  description = "SSL 인증서의 이름입니다"
  value       = oci_load_balancer_certificate.api_certificate.certificate_name
}

# 로깅 정책 정보
output "logging_policy_name" {
  description = "로깅 정책의 이름입니다"
  value       = oci_load_balancer_load_balancer_routing_policy.logging_policy.name
}

output "domain_name" {
  description = "로드밸런서의 도메인 이름입니다"
  value       = "${oci_load_balancer.api_lb.display_name}.oci.oraclecloud.com"
}
