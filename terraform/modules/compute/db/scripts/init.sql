-- modules/compute/db/scripts/init.sql
-- 데이터베이스 초기화를 위한 SQL 스크립트
-- 이 스크립트는 컨테이너 첫 실행 시 자동으로 실행됩니다.

-- 애플리케이션을 위한 새로운 데이터베이스를 생성합니다.
CREATE DATABASE ${db_name};

-- 애플리케이션용 사용자를 생성하고 권한을 부여합니다.
-- 이 사용자는 애플리케이션의 데이터베이스 연결에 사용됩니다.
CREATE USER ${db_user} WITH ENCRYPTED PASSWORD '${db_password}';
GRANT ALL PRIVILEGES ON DATABASE ${db_name} TO ${db_user};

-- 생성된 데이터베이스로 전환합니다.
\c ${db_name}

-- 필수 PostgreSQL 확장을 설치합니다.
-- uuid-ossp: UUID 생성을 위한 확장
-- pgcrypto: 암호화 기능을 위한 확장
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SCHEMA IF NOT EXISTS auth;

-- 여기에 추가적인 초기화 SQL문을 작성할 수 있습니다.
-- 예: 기본 테이블 생성, 초기 데이터 삽입 등