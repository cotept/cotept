resource "oci_waas_waas_policy" "main_waf" {
  compartment_id = var.compartment_id
  display_name   = "${var.project_name}-${var.environment}-main-waf"
  domain         = "*.cotept.com"

  additional_domains = ["cotept.com"]

  waf_config {
    # WebSocket/WebRTC 관련 설정
    access_rules {
      name   = "websocket_base"
      action = "ALLOW"
      criteria {
        condition = "URL_STARTS_WITH"
        value     = "/ws/"
      }
    }

    access_rules {
      name   = "rtc_base"
      action = "ALLOW"
      criteria {
        condition = "URL_STARTS_WITH"
        value     = "/rtc/"
      }
    }

    access_rules {
      name   = "session_websocket"
      action = "ALLOW"
      criteria {
        condition = "URL_STARTS_WITH"
        value     = "/session/ws/"
      }
    }

    access_rules {
      name   = "session_rtc"
      action = "ALLOW"
      criteria {
        condition = "URL_STARTS_WITH"
        value     = "/session/rtc/"
      }
    }

    # Next.js SSR 라우트 보호
    access_rules {
      name   = "nextjs_routes"
      action = "ALLOW"
      criteria {
        condition = "URL_IS"
        value     = "/*"
      }
    }

    # 정적 파일 접근 규칙
    access_rules {
      name   = "static_files"
      action = "ALLOW"
      criteria {
        condition = "URL_STARTS_WITH"
        value     = "/_next/static/"
      }
    }

    protection_settings {
      block_action                 = "SET_RESPONSE_CODE"
      block_response_code          = 403
      block_error_page_message     = "Access blocked by WAF"
      block_error_page_description = "The requested URL was blocked. Please contact administrator if you think this is an error."
    }
  }

  # origin, connections, timeouts 등은 load balancer에서 처리

  freeform_tags = {
    "Environment" = var.environment
    "Project"     = var.project_name
    "ManagedBy"   = "terraform"
    "Service"     = "waf"
  }
}
