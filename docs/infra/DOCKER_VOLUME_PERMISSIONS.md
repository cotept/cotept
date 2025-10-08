# Docker 볼륨 권한 설정 가이드

## 🚨 문제 상황

### 증상
- Oracle DB 컨테이너가 `healthy` 상태인데도 연결 실패
- 컨테이너 로그에 다음과 같은 에러 발생:
  ```
  Cannot create directory "/opt/oracle/oradata/ORCLCDB"
  [FATAL] Recovery Manager failed to restore datafiles
  ```

### 원인
Docker 컨테이너는 특정 유저 권한으로 실행되며, 호스트의 마운트된 볼륨에 쓰기 권한이 없으면 데이터 파일을 생성할 수 없습니다.

**CotePT 프로젝트 구조:**
```
docker/
├── nosql/
│   └── local_data/     # NoSQL 데이터 저장
├── oracle/
│   └── local_data/     # Oracle DB 데이터 저장
└── redis/
    └── local_data/     # Redis 데이터 저장
```

---

## 📊 컨테이너별 실행 유저

| 컨테이너 | 실행 유저 | UID | GID | 용도 |
|---------|---------|-----|-----|------|
| **Oracle DB** | `oracle` | 54321 | 54321 | 데이터베이스 파일, 컨트롤 파일, 리두 로그 |
| **Redis** | `redis` | 999 | 999 | RDB/AOF 백업 파일 |
| **NoSQL** | `oracle` | 1000 | 1000 | NoSQL 데이터베이스 파일 |

---

## 🔧 해결 방법

### 방법 1: 자동 스크립트 사용 (권장)

프로젝트 루트에 `scripts/setup-docker-permissions.sh` 스크립트를 생성하고 실행:

```bash
#!/bin/bash
# scripts/setup-docker-permissions.sh

set -e

echo "🔧 Setting up Docker volume permissions..."
echo ""

# Oracle Database
if [ -d "docker/oracle/local_data" ]; then
  echo "📁 Configuring Oracle permissions..."
  sudo chown -R 54321:54321 docker/oracle/local_data
  sudo chmod -R 755 docker/oracle/local_data
  echo "✅ Oracle permissions set (UID: 54321, GID: 54321)"
else
  echo "⚠️  docker/oracle/local_data not found, creating..."
  mkdir -p docker/oracle/local_data
  sudo chown -R 54321:54321 docker/oracle/local_data
  sudo chmod -R 755 docker/oracle/local_data
  echo "✅ Oracle directory created with proper permissions"
fi

echo ""

# Redis
if [ -d "docker/redis/local_data" ]; then
  echo "📁 Configuring Redis permissions..."
  sudo chown -R 999:999 docker/redis/local_data
  sudo chmod -R 755 docker/redis/local_data
  echo "✅ Redis permissions set (UID: 999, GID: 999)"
else
  echo "⚠️  docker/redis/local_data not found, creating..."
  mkdir -p docker/redis/local_data
  sudo chown -R 999:999 docker/redis/local_data
  sudo chmod -R 755 docker/redis/local_data
  echo "✅ Redis directory created with proper permissions"
fi

echo ""

# NoSQL
if [ -d "docker/nosql/local_data" ]; then
  echo "📁 Configuring NoSQL permissions..."
  sudo chown -R 1000:1000 docker/nosql/local_data
  sudo chmod -R 755 docker/nosql/local_data
  echo "✅ NoSQL permissions set (UID: 1000, GID: 1000)"
else
  echo "⚠️  docker/nosql/local_data not found, creating..."
  mkdir -p docker/nosql/local_data
  sudo chown -R 1000:1000 docker/nosql/local_data
  sudo chmod -R 755 docker/nosql/local_data
  echo "✅ NoSQL directory created with proper permissions"
fi

echo ""
echo "🎉 All Docker volume permissions configured successfully!"
echo ""
echo "Next steps:"
echo "  1. pnpm infra:up        # Start infrastructure"
echo "  2. docker logs -f cotept-local-oracle  # Monitor Oracle initialization"
echo "  3. Wait for 'DATABASE IS READY TO USE!' message (5-10 minutes)"
```

**실행 방법:**
```bash
# 스크립트에 실행 권한 부여
chmod +x scripts/setup-docker-permissions.sh

# 스크립트 실행
./scripts/setup-docker-permissions.sh

# 인프라 시작
pnpm infra:up
```

### 방법 2: 수동 설정

각 디렉토리를 개별적으로 설정:

```bash
# Oracle Database
sudo chown -R 54321:54321 docker/oracle/local_data
sudo chmod -R 755 docker/oracle/local_data

# Redis
sudo chown -R 999:999 docker/redis/local_data
sudo chmod -R 755 docker/redis/local_data

# NoSQL
sudo chown -R 1000:1000 docker/nosql/local_data
sudo chmod -R 755 docker/nosql/local_data
```

---

## 🔍 권한 확인 방법

### 현재 권한 확인
```bash
ls -la docker/oracle/local_data
ls -la docker/redis/local_data
ls -la docker/nosql/local_data
```

**올바른 출력 예시:**
```
# Oracle
drwxr-xr-x 54321 54321 ... local_data

# Redis
drwxr-xr-x 999 999 ... local_data

# NoSQL
drwxr-xr-x 1000 1000 ... local_data
```

### 컨테이너 내부에서 확인
```bash
# Oracle 컨테이너
docker exec cotept-local-oracle id
# 출력: uid=54321(oracle) gid=54321(oinstall)

# Redis 컨테이너
docker exec cotept-local-redis id
# 출력: uid=999(redis) gid=999(redis)

# NoSQL 컨테이너
docker exec cotept-local-nosql id
# 출력: uid=1000(oracle) gid=1000(oracle)
```

---

## 🚀 초기 설정 워크플로우

### 1. Git Clone 직후

```bash
# 1. 프로젝트 클론
git clone <repository-url>
cd cotept

# 2. 의존성 설치
pnpm install

# 3. Docker 볼륨 권한 설정
./scripts/setup-docker-permissions.sh

# 4. 인프라 시작
pnpm infra:up

# 5. Oracle 초기화 완료 대기
docker logs -f cotept-local-oracle
# "DATABASE IS READY TO USE!" 메시지 나올 때까지 대기 (5-10분)
# Ctrl+C로 로그 종료

# 6. 서비스 등록 확인
docker exec cotept-local-oracle lsnrctl status | grep -A 10 "Services Summary"
# orclpdb1 서비스가 등록되어 있어야 함

# 7. 마이그레이션 실행
cd apps/api && pnpm migration:run

# 8. API 서버 시작
pnpm dev
```

### 2. 기존 프로젝트에서 권한 문제 발생 시

```bash
# 1. 인프라 중지
pnpm infra:down

# 2. 권한 재설정
./scripts/setup-docker-permissions.sh

# 3. 인프라 재시작
pnpm infra:up

# 4. Oracle 로그 확인
docker logs -f cotept-local-oracle
```

---

## 🐛 트러블슈팅

### 문제 1: "Cannot create directory" 에러

**증상:**
```
Cannot create directory "/opt/oracle/oradata/ORCLCDB"
[FATAL] Recovery Manager failed to restore datafiles
```

**해결:**
```bash
pnpm infra:down
sudo chown -R 54321:54321 docker/oracle/local_data
sudo chmod -R 755 docker/oracle/local_data
pnpm infra:up
```

### 문제 2: Redis RDB 저장 실패

**증상:**
```
Failed saving the DB: Permission denied
```

**해결:**
```bash
docker stop cotept-local-redis
sudo chown -R 999:999 docker/redis/local_data
sudo chmod -R 755 docker/redis/local_data
docker start cotept-local-redis
```

### 문제 3: Oracle DB 서비스 등록 안 됨

**증상:**
```
Service "orclpdb1" is not registered with the listener
```

**확인:**
```bash
# 1. Oracle 컨테이너가 완전히 초기화되었는지 확인
docker logs cotept-local-oracle | grep "DATABASE IS READY"

# 2. 로그에 "DATABASE IS READY TO USE!" 메시지가 없으면 아직 초기화 중
docker logs -f cotept-local-oracle  # 완료될 때까지 대기
```

**해결:** (초기화 완료 후)
```bash
docker exec -it cotept-local-oracle bash
sqlplus / as sysdba

# SQL*Plus에서:
ALTER PLUGGABLE DATABASE ALL OPEN;
ALTER PLUGGABLE DATABASE ALL SAVE STATE;
ALTER SYSTEM REGISTER;
EXIT;
```

### 문제 4: 컨트롤 파일 에러

**증상:**
```
ORA-00210: cannot open the specified control file
ORA-00202: control file: '/opt/oracle/cfgtoollogs/dbca/ORCLCDB/tempControl.ctl'
```

**원인:**
Oracle DB 초기화가 완료되지 않았거나 실패한 상태

**해결:**
```bash
# 1. 완전히 정리
pnpm infra:down
docker rm cotept-local-oracle
sudo rm -rf docker/oracle/local_data/*

# 2. 권한 재설정
sudo chown -R 54321:54321 docker/oracle/local_data
sudo chmod -R 755 docker/oracle/local_data

# 3. 재시작 및 초기화 대기
pnpm infra:up
docker logs -f cotept-local-oracle
# "DATABASE IS READY TO USE!" 메시지 확인
```

### 문제 5: ADMIN 사용자 인증 실패

**증상:**
```
ORA-01017: invalid username/password; logon denied
```

**원인:**
- 새로운 Oracle DB 컨테이너를 시작하면 PDB(orclpdb1)에는 ADMIN 사용자가 존재하지 않음
- CDB(ORCLCDB)와 PDB(orclpdb1)는 별도의 사용자 관리 체계를 가짐
- .env 파일에 설정된 ADMIN 계정은 PDB에 수동으로 생성해야 함

**Oracle 멀티테넌트 아키텍처 이해:**
```
ORCLCDB (Container Database)
├── system, sys 등의 CDB 사용자
└── orclpdb1 (Pluggable Database)
    └── 별도의 사용자 관리
        ├── ADMIN (수동 생성 필요)
        └── 기타 애플리케이션 사용자
```

**해결: Docker Desktop에서 ADMIN 사용자 생성**

Docker Desktop의 컨테이너 터미널(sh-4.4$)에서 작업:

```bash
# 1. SYSDBA로 SQL*Plus 접속 (비밀번호 불필요)
sqlplus / as sysdba
```

```sql
-- 2. PDB 컨테이너로 세션 전환
ALTER SESSION SET CONTAINER=orclpdb1;

-- 3. ADMIN 사용자 생성 (.env 파일의 비밀번호와 동일하게)
CREATE USER ADMIN IDENTIFIED BY "12qwEr!!love";

-- 4. 필수 권한 부여
GRANT CONNECT, RESOURCE, DBA TO ADMIN;
GRANT CREATE SESSION TO ADMIN;
GRANT UNLIMITED TABLESPACE TO ADMIN;

-- 5. 종료
EXIT;
```

**검증:**
```bash
# 터미널에서 ADMIN 사용자로 직접 연결 테스트
sqlplus ADMIN/12qwEr!!love@orclpdb1
```

또는 API 서버 시작으로 확인:
```bash
cd apps/api
pnpm dev
# AppService 초기화 성공 확인
```

**주의사항:**
- 컨테이너를 완전히 삭제(`docker rm`)하면 ADMIN 사용자도 삭제되므로 재생성 필요
- `pnpm infra:down` 후 `pnpm infra:up`은 볼륨이 유지되므로 사용자도 유지됨
- 비밀번호는 .env 파일의 `DB_PASSWORD` 값과 일치해야 함

---

## 📝 참고 사항

### .gitignore 설정
`docker/*/local_data/` 디렉토리는 반드시 `.gitignore`에 포함되어야 합니다:

```gitignore
# Docker local data
docker/oracle/local_data/
docker/redis/local_data/
docker/nosql/local_data/
```

### WSL2 환경
WSL2에서는 `/mnt/c/` 경로가 아닌 WSL 내부 경로(`/home/user/...`)를 사용하는 것이 권장됩니다.

### macOS 환경
macOS에서는 Docker Desktop의 파일 공유 설정을 확인:
1. Docker Desktop → Preferences → Resources → File Sharing
2. 프로젝트 루트 디렉토리가 포함되어 있는지 확인

### CI/CD 환경
CI/CD 파이프라인에서는 컨테이너를 root 권한으로 실행하거나, 사전에 권한을 설정한 볼륨을 사용하세요.

---

## 🔗 관련 문서

- [Docker Compose 설정](../docker-compose.yml)
- [인프라 아키텍처](./INFRASTRUCTURE_ARCHITECTURE.md)
- [개발 환경 설정](../CLAUDE.md#-local-development-setup)
