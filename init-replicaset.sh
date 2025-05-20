#!/bin/bash
# init-replicaset.sh

echo "MongoDB가 완전히 시작될 때까지 5초 대기..."
sleep 5

echo "MongoDB 레플리카 세트 초기화 중..."
# 레플리카 세트 초기화 시도
INIT_RESULT=$(docker exec -it mongodb mongosh -u root -p 'qwer123!@#' --authenticationDatabase admin --eval 'rs.initiate({_id: "rs0", members: [{_id: 0, host: "localhost:27017"}]})' 2>&1)

# 이미 초기화되었는지 확인
if echo "$INIT_RESULT" | grep -q "already initialized"; then
  echo "레플리카 세트가 이미 초기화되어 있습니다. 계속 진행합니다."
  exit 0
elif echo "$INIT_RESULT" | grep -q "MongoServerError"; then
  echo "MongoDB 초기화 중 오류가 발생했습니다: $INIT_RESULT"
  exit 1
else
  echo "레플리카 세트가 성공적으로 초기화되었습니다."
  exit 0
fi