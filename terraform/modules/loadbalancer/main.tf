# modules/network/loadbalancer/main.tf

# 공통으로 사용될 태그와 이름을 정의합니다.
locals {
  common_tags = merge(
    {
      "Environment" = var.environment
      "Project"     = var.project_name
      "ManagedBy"   = "terraform"
      "Service"     = "loadbalancer"
    },
    var.additional_tags
  )

  lb_name = "${var.project_name}-${var.environment}-lb"
}

# 로드밸런서의 SSL 인증서를 설정합니다.
# 이는 HTTPS 통신을 위해 필요합니다.
resource "oci_load_balancer_certificate" "api_certificate" {
  certificate_name = var.ssl_configuration.certificate_name
  load_balancer_id = oci_load_balancer.api_lb.id

  private_key        = var.ssl_configuration.private_key
  public_certificate = var.ssl_configuration.public_certificate
  ca_certificate     = var.ssl_configuration.ca_certificate

  lifecycle {
    create_before_destroy = true
  }
}

# 로드밸런서 본체를 생성합니다.
# 이는 모든 외부 트래픽의 진입점이 됩니다.
resource "oci_load_balancer" "api_lb" {
  compartment_id = var.compartment_id
  display_name   = local.lb_name
  shape          = var.load_balancer_shape
  subnet_ids     = [var.subnet_id]

  # 로드밸런서의 네트워크 대역폭을 설정합니다.
  shape_details {
    minimum_bandwidth_in_mbps = var.load_balancer_shape_details.minimum_bandwidth_in_mbps
    maximum_bandwidth_in_mbps = var.load_balancer_shape_details.maximum_bandwidth_in_mbps
  }

  # 네트워크 보안 그룹 설정은 network 모듈에서 정의된 것을 사용합니다.
  network_security_group_ids = []

  freeform_tags = local.common_tags
}

# API 서버를 위한 백엔드 세트를 구성합니다.
resource "oci_load_balancer_backend_set" "api_backend_set" {
  name             = "api-backend-set"
  load_balancer_id = oci_load_balancer.api_lb.id
  policy           = "ROUND_ROBIN"

  # 백엔드 서버의 상태를 주기적으로 확인하는 설정입니다.
  health_checker {
    protocol            = "HTTP"
    port                = var.backend_port
    url_path            = var.health_check_url
    interval_ms         = 10000 # 10초마다 체크
    timeout_in_millis   = 3000  # 3초 타임아웃
    retries             = 3
    return_code         = 200
    response_body_regex = ".*"
  }

  # 세션 지속성 설정
  # WebSocket 연결의 지속성을 보장하기 위해 필요합니다.
  session_persistence_configuration {
    cookie_name      = "lb-session"
    disable_fallback = true
  }
}

# HTTPS 트래픽을 처리하는 리스너입니다.
resource "oci_load_balancer_listener" "https_listener" {
  name                     = "https-listener"
  load_balancer_id         = oci_load_balancer.api_lb.id
  default_backend_set_name = oci_load_balancer_backend_set.api_backend_set.name
  port                     = 443
  protocol                 = "HTTP"

  ssl_configuration {
    certificate_name        = var.ssl_configuration.certificate_name
    verify_peer_certificate = false
    protocols               = ["TLSv1.2", "TLSv1.3"]
    cipher_suite_name       = "oci-modern-security-cipher-suite-v1"
  }

  connection_configuration {
    idle_timeout_in_seconds = 1200 # 20분
  }
}

# WebSocket 연결을 처리하는 리스너입니다.
resource "oci_load_balancer_listener" "websocket_listener" {
  name                     = "websocket-listener"
  load_balancer_id         = oci_load_balancer.api_lb.id
  default_backend_set_name = oci_load_balancer_backend_set.api_backend_set.name
  port                     = 8080
  protocol                 = "HTTP"

  ssl_configuration {
    certificate_name        = var.ssl_configuration.certificate_name
    verify_peer_certificate = false
    protocols               = ["TLSv1.2", "TLSv1.3"]
    cipher_suite_name       = "oci-modern-security-cipher-suite-v1"
  }

  # WebSocket은 더 긴 타임아웃이 필요합니다
  connection_configuration {
    idle_timeout_in_seconds = 4800 # 1시간 20분
  }
}

# 라우팅 정책
resource "oci_load_balancer_load_balancer_routing_policy" "main_policy" {
  condition_language_version = "V1"
  load_balancer_id           = oci_load_balancer.api_lb.id
  name                       = "main-routing-policy"

  # 로깅 규칙
  rules {
    name      = "access-logging"
    condition = "any(http.request.url)"
    actions {
      name             = "FORWARD_TO_BACKENDSET"
      backend_set_name = oci_load_balancer_backend_set.api_backend_set.name
    }
  }

  # CORS 규칙
  rules {
    name      = "enable-cors"
    condition = "any(http.request.headers[\"origin\"])"
    actions {
      name             = "FORWARD_TO_BACKENDSET"
      backend_set_name = oci_load_balancer_backend_set.api_backend_set.name
    }
  }
}

# CORS 응답 헤더 수정
resource "oci_load_balancer_rule_set" "cors_rules" {
  load_balancer_id = oci_load_balancer.api_lb.id
  name             = "cors-rules"

  items {
    action = "ADD_HTTP_RESPONSE_HEADER"
    header = "Access-Control-Allow-Origin"
    value  = "*.cotept.com"
  }

  items {
    action = "ADD_HTTP_RESPONSE_HEADER"
    header = "Access-Control-Allow-Methods"
    value  = "GET, POST, OPTIONS"
  }

  items {
    action = "ADD_HTTP_RESPONSE_HEADER"
    header = "Access-Control-Allow-Headers"
    value  = "Authorization, Content-Type, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers, Upgrade, Connection, X-WebRTC-SDP, X-WebRTC-ICE, X-TURN-Credentials"
  }

  # WebSocket 지원을 위한 추가 헤더
  items {
    action = "ADD_HTTP_RESPONSE_HEADER"
    header = "Access-Control-Allow-Credentials"
    value  = "true"
  }
}

resource "oci_load_balancer_backend" "api_backend" {
  load_balancer_id = oci_load_balancer.api_lb.id
  backendset_name  = oci_load_balancer_backend_set.api_backend_set.name
  ip_address       = var.api_server_ip # API 서버의 private IP
  port             = var.backend_port
  weight           = 1
}
