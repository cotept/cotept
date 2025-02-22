# modules/compute/coturn/outputs.tf

output "instance_id" {
  description = "Coturn Container Instance의 OCID입니다"
  value       = oci_container_instances_container_instance.coturn.id
}

output "public_ip" {
  description = "Coturn 서버의 공개 IP 주소입니다. WebRTC 클라이언트가 이 주소로 연결합니다"
  value       = oci_container_instances_container_instance.coturn.vnics[0].public_ip
}

output "turn_config" {
  description = "WebRTC 연결에 필요한 TURN 설정 정보입니다"
  value = {
    urls = [
      "turn:${oci_container_instances_container_instance.coturn.vnics[0].public_ip}:3478",
      "turns:${oci_container_instances_container_instance.coturn.vnics[0].public_ip}:5349"
    ]
    username   = var.turn_user
    credential = var.turn_password
  }
  sensitive = false # 클라이언트에서 사용해야 하므로 민감 정보로 표시하지 않습니다
}

output "ports" {
  description = "Coturn 서버가 사용하는 포트 정보입니다"
  value = {
    stun_turn     = 3478
    stun_turn_tls = 5349
    media_min     = var.turn_port_min
    media_max     = var.turn_port_max
  }
}

output "log_group_id" {
  description = "Coturn 로그 그룹의 OCID입니다"
  value       = module.coturn_stdout_logs.log_group_id
}
