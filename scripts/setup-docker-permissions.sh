#!/bin/bash
# scripts/setup-docker-permissions.sh
# Docker 볼륨 권한 자동 설정 스크립트

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
