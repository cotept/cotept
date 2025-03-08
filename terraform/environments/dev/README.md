# Cotept 개발 환경 구성 가이드

## 사전 준비사항

1. OCI CLI 설정
2. Terraform 설치 (v4.123.0 이상)
3. 개발용 SSL 인증서 생성

## 환경 구성 단계

1. `example.tfvars`를 `terraform.tfvars`로 복사
2. `terraform.tfvars` 파일에 실제 값 입력
3. `terraform init` 실행
4. `terraform plan` 으로 변경사항 확인
5. `terraform apply` 로 환경 구성

## 주의사항

- 민감한 정보는 반드시 `terraform.tfvars`에 저장
- SSL 인증서는 `certs/` 디렉토리에 저장
- 모든 리소스는 'dev' 환경으로 태깅됨

typeorm atp 설정 -> 마이그레이션방식
