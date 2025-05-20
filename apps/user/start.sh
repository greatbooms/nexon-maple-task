#!/bin/sh
# start.sh

# 환경 변수 출력 (디버깅용)
echo "DATABASE_URL is: $DATABASE_URL"

# 데이터베이스 마이그레이션 실행
echo "Running database migrations..."
# 환경 변수를 직접 명령에 전달
DATABASE_URL="$DATABASE_URL" npx prisma db push --schema ./apps/user/src/prisma/schema.prisma

# 애플리케이션 실행
echo "Starting application..."
node ./apps/user/main.js