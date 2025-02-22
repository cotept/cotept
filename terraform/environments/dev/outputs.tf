# Network 출력값
output "vcn_id" {
  description = "VCN의 OCID"
  value       = module.network.vcn_id
}

output "public_subnet_id" {
  description = "퍼블릭 서브넷 OCID"
  value       = module.network.public_subnet_id
}

output "private_app_subnet_id" {
  description = "프라이빗 앱 서브넷 OCID"
  value       = module.network.private_app_subnet_id
}

output "private_database_subnet_id" {
  description = "프라이빗 데이터베이스 서브넷 OCID"
  value       = module.network.private_database_subnet_id
}

# # Database 출력값
# output "db_private_ip" {
#   description = "PostgreSQL 프라이빗 IP"
#   value       = module.postgresql.private_ip
# }

# # Redis 출력값
# output "redis_private_ip" {
#   description = "Redis 프라이빗 IP"
#   value       = module.redis.private_ip
# }

# # API 서버 출력값
# output "api_private_ip" {
#   description = "API 서버 프라이빗 IP"
#   value       = module.api.private_ip
# }

# # Load Balancer 출력값
# output "load_balancer_ip" {
#   description = "로드밸런서 퍼블릭 IP"
#   value       = module.loadbalancer.load_balancer_ip
# }

# # Coturn 출력값
# output "coturn_public_ip" {
#   description = "Coturn 서버 퍼블릭 IP"
#   value       = module.coturn.public_ip
# }
