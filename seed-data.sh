#!/bin/bash
echo "데이터베이스에 샘플 데이터 삽입 중..."
docker exec -it mongodb mongosh -u root -p 'qwer123!@#' --authenticationDatabase admin ./data/seed-data.js
echo "샘플 데이터 삽입 완료!"