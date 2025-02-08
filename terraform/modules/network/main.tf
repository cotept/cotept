# modules/network/main.tf

# OCI 서비스 목록을 가져오기 위한 데이터 소스
# 서비스 게이트웨이 구성에 필요한 OCI 서비스들의 정보를 제공합니다
data "oci_core_services" "all" {
  compartment_id = var.compartment_id
}

# VCN(Virtual Cloud Network) 생성
# 이는 클라우드 네트워크의 기본 컨테이너로, 모든 네트워크 리소스를 포함합니다.
resource "oci_core_vcn" "main" {
  compartment_id = var.compartment_id
  cidr_blocks    = [var.vcn_cidr]
  display_name   = "${var.project_name}-${var.environment}-vcn"
  dns_label      = var.create_dns_label ? "${var.dns_label_prefix}${var.environment}" : null

  freeform_tags = merge(
    {
      "Environment" = var.environment
      "Project"     = var.project_name
      "ManagedBy"   = "terraform"
    },
    var.additional_tags
  )
}

# 인터넷 게이트웨이 생성
# 퍼블릭 서브넷의 리소스가 인터넷과 통신할 수 있게 해줍니다.
resource "oci_core_internet_gateway" "main" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-${var.environment}-ig"
  enabled        = true

  freeform_tags = merge(
    {
      "Environment" = var.environment
      "Project"     = var.project_name
      "ManagedBy"   = "terraform"
    },
    var.additional_tags
  )
}

# NAT 게이트웨이 생성
# 프라이빗 서브넷의 리소스가 인터넷으로 나갈 수 있게 해주지만, 
# 외부에서의 직접적인 접근은 차단합니다.
resource "oci_core_nat_gateway" "main" {
  count = var.enable_nat_gateway ? 1 : 0

  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-${var.environment}-nat"

  freeform_tags = merge(
    {
      "Environment" = var.environment
      "Project"     = var.project_name
      "ManagedBy"   = "terraform"
    },
    var.additional_tags
  )
}

# 서비스 게이트웨이 생성
# OCI의 내부 서비스(Object Storage 등)에 대한 접근을 제공합니다.
resource "oci_core_service_gateway" "main" {
  count = var.enable_service_gateway ? 1 : 0

  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-${var.environment}-sg"

  services {
    service_id = data.oci_core_services.all.services[0].id
  }

  freeform_tags = merge(
    {
      "Environment" = var.environment
      "Project"     = var.project_name
      "ManagedBy"   = "terraform"
    },
    var.additional_tags
  )
}

# 퍼블릭 서브넷을 위한 라우트 테이블
# 인터넷으로 나가는 트래픽을 인터넷 게이트웨이로 라우팅합니다
resource "oci_core_route_table" "public" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-${var.environment}-public-rt"

  # 라우팅 규칙을 동적으로 생성합니다
  dynamic "route_rules" {
    for_each = var.public_route_rules
    content {
      description      = route_rules.value.description
      destination     = route_rules.value.destination
      destination_type = route_rules.value.destination_type
      network_entity_id = oci_core_internet_gateway.main.id
    }
  }

  freeform_tags = merge(
    {
      "Environment" = var.environment
      "Project"     = var.project_name
      "ManagedBy"   = "terraform"
      "Type"        = "public"
    },
    var.additional_tags
  )
}

# 프라이빗 서브넷을 위한 라우트 테이블
# NAT 게이트웨이와 서비스 게이트웨이를 통한 트래픽을 라우팅합니다
resource "oci_core_route_table" "private" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-${var.environment}-private-rt"

  # NAT 게이트웨이를 통한 인터넷 접근을 위한 라우팅 규칙
  dynamic "route_rules" {
    for_each = var.enable_nat_gateway ? var.private_route_rules : []
    content {
      description      = route_rules.value.description
      destination     = route_rules.value.destination
      destination_type = route_rules.value.destination_type
      network_entity_id = oci_core_nat_gateway.main[0].id
    }
  }

  # 서비스 게이트웨이를 통한 OCI 서비스 접근을 위한 라우팅 규칙
  dynamic "route_rules" {
    for_each = var.enable_service_gateway ? [1] : []
    content {
      description      = "OCI 서비스로의 접근"
      destination      = data.oci_core_services.all.services[0].cidr_block
      destination_type = "SERVICE_CIDR_BLOCK"
      network_entity_id = oci_core_service_gateway.main[0].id
    }
  }

  freeform_tags = merge(
    {
      "Environment" = var.environment
      "Project"     = var.project_name
      "ManagedBy"   = "terraform"
      "Type"        = "private"
    },
    var.additional_tags
  )
}

# 퍼블릭 서브넷 (로드밸런서, Coturn용)
resource "oci_core_subnet" "public_lb" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  
  cidr_block        = var.public_subnet_cidr
  display_name      = "${var.project_name}-${var.environment}-public-subnet"
  dns_label         = var.create_dns_label ? "public" : null
  security_list_ids = [oci_core_security_list.public.id]
  route_table_id    = oci_core_route_table.public.id
  
  prohibit_public_ip_on_vnic = false
  
  freeform_tags = merge(
    {
      "Environment" = var.environment
      "Project"     = var.project_name
      "ManagedBy"   = "terraform"
      "Purpose"     = "load-balancer-and-coturn"
    },
    var.additional_tags
  )
}

# 프라이빗 애플리케이션 서브넷 (NestJS 애플리케이션용)
resource "oci_core_subnet" "private_app" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  
  cidr_block        = var.private_app_subnet_cidr
  display_name      = "${var.project_name}-${var.environment}-private-app-subnet"
  dns_label         = var.create_dns_label ? "privateapp" : null
  security_list_ids = [oci_core_security_list.private_app.id]
  route_table_id    = oci_core_route_table.private.id
  
  # 프라이빗 서브넷이므로 퍼블릭 IP 할당을 차단합니다
  prohibit_public_ip_on_vnic = true
  
  freeform_tags = merge(
    {
      "Environment" = var.environment
      "Project"     = var.project_name
      "ManagedBy"   = "terraform"
      "Purpose"     = "nestjs-application"
    },
    var.additional_tags
  )
}

# 프라이빗 데이터베이스 서브넷
resource "oci_core_subnet" "private_database" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  
  cidr_block        = var.private_database_subnet_cidr
  display_name      = "${var.project_name}-${var.environment}-private-db-subnet"
  dns_label         = var.create_dns_label ? "privatedb" : null
  security_list_ids = [oci_core_security_list.private_database.id]
  route_table_id    = oci_core_route_table.private.id
  
  # 프라이빗 서브넷이므로 퍼블릭 IP 할당을 차단합니다
  prohibit_public_ip_on_vnic = true
  
  freeform_tags = merge(
    {
      "Environment" = var.environment
      "Project"     = var.project_name
      "ManagedBy"   = "terraform"
      "Purpose"     = "database"
    },
    var.additional_tags
  )
}

# 애플리케이션 서버용 보안 리스트
# 퍼블릭 서브넷 보안 리스트 (로드밸런서, Coturn용)
resource "oci_core_security_list" "public" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-${var.environment}-public-seclist"

  # HTTP/HTTPS 트래픽을 위한 인바운드 규칙
  ingress_security_rules {
    protocol = "6"  # TCP
    source   = "0.0.0.0/0"
    tcp_options {
      min = 80
      max = 80
    }
    description = "HTTP 인바운드"
  }

  ingress_security_rules {
    protocol = "6"  # TCP
    source   = "0.0.0.0/0"
    tcp_options {
      min = 443
      max = 443
    }
    description = "HTTPS 인바운드"
  }

  # Coturn 서버를 위한 STUN/TURN 포트
  ingress_security_rules {
    protocol = "6"  # TCP
    source   = "0.0.0.0/0"
    tcp_options {
      min = 3478
      max = 3478
    }
    description = "STUN/TURN TCP"
  }

  ingress_security_rules {
    protocol = "17"  # UDP
    source   = "0.0.0.0/0"
    udp_options {
      min = 3478
      max = 3478
    }
    description = "STUN/TURN UDP"
  }

  # WebRTC 미디어 트래픽용 UDP 포트 범위
  ingress_security_rules {
    protocol = "17"  # UDP
    source   = "0.0.0.0/0"
    udp_options {
      min = 49152
      max = 65535
    }
    description = "WebRTC 미디어"
  }

  # 프라이빗 앱 서브넷으로의 아웃바운드 규칙
  egress_security_rules {
    protocol    = "6"  # TCP
    destination = var.private_app_subnet_cidr
    tcp_options {
      min = 3000
      max = 3000
    }
    description = "NestJS 애플리케이션 통신"
  }

  freeform_tags = merge(
    {
      "Environment" = var.environment
      "Project"     = var.project_name
      "ManagedBy"   = "terraform"
      "Type"        = "public-security"
    },
    var.additional_tags
  )
}

# 프라이빗 애플리케이션 서브넷 보안 리스트 (NestJS 애플리케이션용)
resource "oci_core_security_list" "private_app" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-${var.environment}-private-app-seclist"

  # 로드밸런서로부터의 인바운드 트래픽을 허용합니다
  ingress_security_rules {
    protocol = "6"  # TCP
    source   = var.public_subnet_cidr
    tcp_options {
      min = 3000
      max = 3000
    }
    description = "로드밸런서로부터의 애플리케이션 트래픽"
  }

  # 헬스 체크를 위한 로드밸런서 트래픽을 허용합니다
  ingress_security_rules {
    protocol = "6"  # TCP
    source   = var.public_subnet_cidr
    tcp_options {
      min = 3000
      max = 3000
    }
    description = "로드밸런서 헬스 체크"
  }

  # 데이터베이스로의 아웃바운드 트래픽을 허용합니다
  egress_security_rules {
    protocol    = "6"  # TCP
    destination = var.private_database_subnet_cidr
    tcp_options {
      min = 5432
      max = 5432
    }
    description = "데이터베이스 연결"
  }

  # NAT 게이트웨이를 통한 외부 인터넷 접근을 허용합니다 (패키지 업데이트 등을 위해)
  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
    description = "외부 인터넷 접근 (NAT 게이트웨이 경유)"
  }

  freeform_tags = merge(
    {
      "Environment" = var.environment
      "Project"     = var.project_name
      "ManagedBy"   = "terraform"
      "Type"        = "private-app-security"
    },
    var.additional_tags
  )
}

# 프라이빗 데이터베이스 서브넷 보안 리스트
resource "oci_core_security_list" "private_database" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.project_name}-${var.environment}-private-db-seclist"

  # NestJS 애플리케이션으로부터의 데이터베이스 연결만 허용합니다
  ingress_security_rules {
    protocol = "6"  # TCP
    source   = var.private_app_subnet_cidr
    tcp_options {
      min = 5432
      max = 5432
    }
    description = "애플리케이션으로부터의 PostgreSQL 연결"
  }

  # 시스템 업데이트를 위한 외부 접근을 허용합니다
  egress_security_rules {
    protocol    = "6"  # TCP
    destination = "0.0.0.0/0"
    tcp_options {
      min = 443
      max = 443
    }
    description = "시스템 업데이트 (HTTPS)"
  }

  # 애플리케이션으로의 응답 트래픽을 허용합니다
  egress_security_rules {
    protocol    = "6"  # TCP
    destination = var.private_app_subnet_cidr
    tcp_options {
      min = 32768
      max = 65535
    }
    description = "애플리케이션으로의 응답 트래픽"
  }

  freeform_tags = merge(
    {
      "Environment" = var.environment
      "Project"     = var.project_name
      "ManagedBy"   = "terraform"
      "Type"        = "private-db-security"
    },
    var.additional_tags
  )
}