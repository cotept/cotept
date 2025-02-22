# # environments/dev/main.tf

# # 1. IAM 모듈 (권한 관리)
# module "iam" {
#   source = "../../modules/security/iam"

#   compartment_id = var.compartment_id
#   tenancy_ocid   = var.tenancy_ocid
#   environment    = "dev"
#   project_name   = var.project_name
# }


# # 2. Vault 모듈 (시크릿 관리)
# module "vault" {
#   source = "../../modules/security/vault"

#   compartment_id = var.compartment_id
#   project_name   = var.project_name
#   environment    = "dev"
#   secret_version = 1

#   # 시크릿 값 설정
#   db_root_password    = var.db_root_password    # 변수명 수정
#   db_app_password     = var.db_app_password     # 변수명 수정
#   redis_password      = var.redis_password
#   jwt_secret          = var.jwt_secret
#   turn_password       = var.turn_password
#   ssl_private_key     = file(var.ssl_private_key_path)
#   ssl_certificate     = file(var.ssl_public_cert_path)
#   ssl_ca_certificate  = file(var.ssl_ca_cert_path)

#   depends_on = [module.iam]
# }


# # 3. Network 모듈 (네트워크 인프라)
# module "network" {
#   source = "../../modules/network"

#   compartment_id = var.compartment_id
#   environment    = "dev"
#   project_name   = var.project_name
#   region         = var.region  # 이 줄 추가

#   # VCN 및 서브넷 CIDR 설정
#   vcn_cidr                 = "10.0.0.0/16"
#   public_subnet_cidr       = "10.0.1.0/24"    # 로드밸런서, Coturn용
#   private_app_subnet_cidr  = "10.0.2.0/24"    # API 서버용
#   private_database_subnet_cidr = "10.0.3.0/24" # PostgreSQL, Redis용

#   # WebRTC 관련 포트 설정
#   allowed_webrtc_ports = {
#     min = 49152
#     max = 65535
#   }

#   additional_tags = var.additional_tags
# }

# # 4. PostgreSQL 데이터베이스
# module "postgresql" {
#   depends_on = [module.vault, module.network]
#   source = "../../modules/compute/db"

#   compartment_id = var.compartment_id
#   subnet_id      = module.network.private_database_subnet_id
#   project_name   = var.project_name
#   environment    = "dev"
#   postgres_password = var.db_root_password

#   # 개발 환경용 리소스 설정
#   cpu_count      = 1
#   memory_in_gbs  = 6

#   # 데이터베이스 설정
#   db_name        = "mentoring"
#   db_user        = "mentoring_user"
#   db_password    = var.db_app_password

#   additional_tags = var.additional_tags
# }

# # 5. Redis 세션 스토어
# module "redis" {
#   depends_on = [module.vault, module.network]
#   source = "../../modules/compute/redis"

#   compartment_id = var.compartment_id
#   subnet_id      = module.network.private_database_subnet_id
#   project_name   = var.project_name
#   environment    = "dev"

#   # 개발 환경용 리소스 설정
#   cpu_count     = 1
#   memory_in_gbs = 6
#   maxmemory_mb  = 4096  # 4GB

#   redis_password = var.redis_password

#   vault_secrets = {
#     redis = {
#       id      = module.vault.secrets.application.redis.id
#       version = module.vault.secrets.application.redis.version
#     }
#   }

#   additional_tags = var.additional_tags
# }

# # 6. API 서버
# module "api" {
#   depends_on = [module.vault, module.network, module.postgresql, module.redis]
#   source = "../../modules/compute/api"

#   compartment_id = var.compartment_id
#   subnet_id      = module.network.private_app_subnet_id
#   project_name   = var.project_name
#   environment    = "dev"

#   # 개발 환경용 리소스 설정
#   cpu_count     = 1
#   memory_in_gbs = 6

#   vault_secrets = {
#     database = {
#       app_password = {
#         id      = module.vault.secrets.database.app_password.id
#         version = module.vault.secrets.database.app_password.version
#       }
#     }
#     application = {
#       redis = {
#         id      = module.vault.secrets.application.redis.id
#         version = module.vault.secrets.application.redis.version
#       }
#       jwt = {
#         id      = module.vault.secrets.application.jwt.id
#         version = module.vault.secrets.application.jwt.version
#       }
#     }
#   }

#   additional_tags = var.additional_tags
# }

# # 7. Coturn 서버
# module "coturn" {
#   depends_on = [module.vault, module.network, module.redis]
#   source = "../../modules/compute/coturn"

#   compartment_id = var.compartment_id
#   subnet_id      = module.network.public_subnet_id
#   project_name   = var.project_name
#   environment    = "dev"

#   # 개발 환경용 리소스 설정
#   cpu_count     = 1
#   memory_in_gbs = 6

#   # TURN 서버 설정
#   turn_user     = var.turn_user
#   turn_password = var.turn_password
#   turn_port_min = 49152
#   turn_port_max = 65535

#   # Redis 연동 설정
#   redis_host     = module.redis.private_ip
#   redis_password = var.redis_password

#   vault_secrets = {
#     turn = {
#       id      = module.vault.secrets.application.turn.id
#       version = module.vault.secrets.application.turn.version
#     }
#   }

#   security_group_id = module.network.coturn_security_group_id

#   additional_tags = var.additional_tags
# }

# # 8. 로드밸런서
# module "loadbalancer" {
#   depends_on = [module.network, module.api]
#   source = "../../modules/loadbalancer"

#   compartment_id = var.compartment_id
#   subnet_id      = module.network.public_subnet_id
#   project_name   = var.project_name
#   environment    = "dev"

#   api_server_ip  = module.api.private_ip

#   # SSL 인증서 설정
#   ssl_configuration = {
#     certificate_name    = "api-cert"
#     private_key        = file(var.ssl_private_key_path)
#     public_certificate = file(var.ssl_public_cert_path)
#     ca_certificate     = file(var.ssl_ca_cert_path)
#   }

#   additional_tags = var.additional_tags
# }

# # 9. DNS 설정
# module "dns" {
#   depends_on = [module.loadbalancer, module.coturn]
#   source = "../../modules/dns"

#   compartment_id = var.compartment_id
#   environment    = "dev"
#   domain_name    = "cotept.me"
#   dns_ttl        = 300

#   # 로드밸런서 정보
#   load_balancer_ip     = module.loadbalancer.public_ip
#   load_balancer_id     = module.loadbalancer.load_balancer_id
#   load_balancer_domain = "${module.loadbalancer.load_balancer_name}.${var.region}.oci.oraclecloud.com"

#   # Coturn 서버 정보
#   coturn_server_ip = module.coturn.public_ip

#   # CDN 도메인 설정 (www 서브도메인 추가)
#   static_cdn_domain = "www.cotept.me"               # 메인 웹사이트
#   api_domain        = "www.api.cotept.me"          # API 서버
#   vod_cdn_domain    = "www.vod.cotept.me"          # VOD 서비스
#   turn_domain       = "www.turn.cotept.me"         # TURN 서버

#   # 인증서 정보
#   cert_private_key_id = module.vault.secrets.ssl.private_key.id
#   cert_public_key_id  = module.vault.secrets.ssl.certificate.id

#   # Vault 시크릿
#   vault_secrets = {
#     ssl = {
#       private_key = {
#         content = module.vault.secrets.ssl.private_key.content
#       }
#       certificate = {
#         content = module.vault.secrets.ssl.certificate.content
#       }
#       ca_certificate = {
#         content = module.vault.secrets.ssl.ca_certificate.content
#       }
#     }
#   }
# }

# # 10. WAF 설정
# module "waf" {
#   depends_on = [module.loadbalancer]
#   source = "../../modules/waf"

#   project_name   = var.project_name
#   environment    = "dev"
#   compartment_id = var.compartment_id
#   region         = var.region

#   # API 원본 설정
#   api_origin = "api.cotept.me"

#   # 타임아웃 설정
#   websocket_timeout   = 60  # 기본값
#   connection_timeout  = 300 # 기본값
# }
