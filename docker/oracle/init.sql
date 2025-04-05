-- 사용자에게 필요한 추가 권한 부여
ALTER SESSION SET CONTAINER=XEPDB1;
GRANT DBA TO ADMIN;
GRANT CREATE SESSION TO ADMIN;
GRANT UNLIMITED TABLESPACE TO ADMIN;

CREATE TABLE USERS (
    user_id VARCHAR2(36) PRIMARY KEY,
    email VARCHAR2(100) UNIQUE NOT NULL,
    password_hash VARCHAR2(255) NOT NULL,
    salt VARCHAR2(100) NOT NULL,
    role VARCHAR2(20) NOT NULL CHECK (role IN ('MENTEE', 'MENTOR', 'ADMIN')),
    status VARCHAR2(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DEACTIVATED')),
    phone_number VARCHAR2(20),
    phone_verified NUMBER(1) DEFAULT 0,
    ci_hash VARCHAR2(255),        -- 연계정보(CI) 암호화 값
    di_hash VARCHAR2(255),        -- 중복가입확인정보(DI) 암호화 값
    name VARCHAR2(100),           -- 실명
    birth_date VARCHAR2(10),      -- 생년월일 (YYYY-MM-DD)
    gender VARCHAR2(1),           -- 성별 ('M', 'F')
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    last_login_at TIMESTAMP
);

CREATE INDEX idx_users_email ON USERS(email);
CREATE INDEX idx_users_role ON USERS(role);
CREATE INDEX idx_users_status ON USERS(status);