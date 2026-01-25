## redis

# 1. Docker 컨테이너 실행 상태 확인

docker ps | grep redis

결과 실행중

# 2. Redis 컨테이너 로그 확인

docker logs cotept-local-redis

결과: 없음

# 3. Redis 헬스체크 확인

docker inspect cotept-local-redis | grep -A 10 "Health"

결과:

```bash
"Health": {
                "Status": "healthy",
                "FailingStreak": 0,
                "Log": [
                    {
                        "Start": "2025-08-26T15:07:48.66510766Z",
                        "End": "2025-08-26T15:07:48.693413593Z",
                        "ExitCode": 0,
                        "Output": "NOAUTH Authentication required.\n\n"
                    },
                    {
--
            "Healthcheck": {
                "Test": [
                    "CMD",
                    "redis-cli",
                    "ping"
                ],
                "Interval": 5000000000,
                "Timeout": 5000000000,
                "Retries": 5
            },
            "Image": "redis:7-alpine",
```

B. Redis CLI로 직접 연결 테스트

# 1. Redis CLI 접속 (포트는 .env.local의 REDIS_PORT 확인)

docker exec -it cotept-local-redis redis-cli

결과 127.0.0.1:6379>

# 2. 연결되면 다음 명령어로 테스트

redis-cli> ping

결과 127.0.0.1:6379> ping
(error) NOAUTH Authentication required.

# 응답: PONG (정상)

redis-cli> info server

# Redis 서버 정보 출력

redis-cli> exit

C. 호스트에서 Redis 연결 테스트

# 1. 로컬에서 Redis 포트 확인 (기본적으로 6379)

telnet localhost 6379

# 또는

nc -zv localhost 6379

D. API 서버에서 Redis 연결 확인

# API 서버 로그에서 Redis 연결 관련 로그 확인

docker logs cotept-local-api | grep -i redis

# 또는 개발 서버 실행 시 연결 로그 확인

cd apps/api
pnpm dev
