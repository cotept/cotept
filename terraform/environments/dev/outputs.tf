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

# ATP 데이터베이스 출력값
output "atp_id" {
  description = "ATP 데이터베이스 OCID"
  value       = module.atp.id
}

output "atp_db_name" {
  description = "ATP 데이터베이스 이름"
  value       = module.atp.db_name
}

output "atp_service_console_url" {
  description = "ATP 서비스 콘솔 URL"
  value       = module.atp.service_console_url
}

output "atp_wallet_secret_id" {
  description = "OCI Vault에 저장된 지갑 시크릿의 OCID"
  value       = module.atp.wallet_secret_id
}

output "atp_wallet_secret_name" {
  description = "OCI Vault에 저장된 지갑 시크릿의 이름"
  value       = module.atp.wallet_secret_name
}

output "atp_wallet_password_secret_id" {
  description = "OCI Vault에 저장된 지갑 비밀번호 시크릿의 OCID"
  value       = module.atp.wallet_password_secret_id
}

output "atp_wallet_password_secret_name" {
  description = "OCI Vault에 저장된 지갑 비밀번호 시크릿의 이름"
  value       = module.atp.wallet_password_secret_name
}
