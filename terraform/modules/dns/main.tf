# modules/dns/main.tf

# DNS 존 생성
resource "oci_dns_zone" "cotept_zone" {
  compartment_id = var.compartment_id
  name           = var.domain_name
  zone_type      = "PRIMARY"

  freeform_tags = {
    "Environment" = var.environment
    "ManagedBy"   = "terraform"
    "Service"     = "dns"
  }
}

# 루트 도메인 (A 레코드)
resource "oci_dns_record" "root" {
  zone_name_or_id = oci_dns_zone.cotept_zone.id
  domain          = var.domain_name
  rtype           = "A"
  rdata           = var.load_balancer_ip
  ttl             = var.dns_ttl
}

# API 서브도메인 (CNAME)
resource "oci_dns_record" "api" {
  zone_name_or_id = oci_dns_zone.cotept_zone.id
  domain          = "api.${var.domain_name}"
  rtype           = "CNAME"
  rdata           = var.load_balancer_domain # 로드밸런서의 도메인
  ttl             = var.dns_ttl
}

# TURN 서버 (A 레코드)
resource "oci_dns_record" "turn" {
  zone_name_or_id = oci_dns_zone.cotept_zone.id
  domain          = "turn.${var.domain_name}"
  rtype           = "A"
  rdata           = var.coturn_server_ip
  ttl             = var.dns_ttl
}

# VOD 서브도메인 (CNAME)
resource "oci_dns_record" "vod" {
  zone_name_or_id = oci_dns_zone.cotept_zone.id
  domain          = "vod.${var.domain_name}"
  rtype           = "CNAME"
  rdata           = var.vod_cdn_domain # CDN 도메인
  ttl             = var.dns_ttl
}
# 인증서 리소스
resource "oci_load_balancer_certificate" "cert" {
  load_balancer_id   = var.load_balancer_id
  certificate_name   = "cotept-cert"
  private_key        = var.vault_secrets.ssl.private_key.content
  public_certificate = var.vault_secrets.ssl.certificate.content
  ca_certificate     = var.vault_secrets.ssl.ca_certificate.content
}
