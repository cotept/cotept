output "zone_id" {
  description = "생성된 DNS 존의 OCID"
  value       = oci_dns_zone.main.id
}

output "zone_name" {
  description = "DNS 존 이름"
  value       = oci_dns_zone.main.name
}

output "api_fqdn" {
  description = "API 서버의 FQDN"
  value       = oci_dns_record.api.name
}

output "turn_fqdn" {
  description = "TURN 서버의 FQDN"
  value       = oci_dns_record.turn.name
}
