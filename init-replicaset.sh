#!/bin/bash

echo "MongoDB가 완전히 시작될 때까지 대기 중..."
for i in {1..30}; do
  if docker exec mongodb mongosh --quiet --eval "db.adminCommand('ping')" &>/dev/null; then
    echo "MongoDB 서버가 응답합니다. 계속 진행합니다."
    break
  fi
  echo "MongoDB 서버 대기 중... ($i/30)"
  sleep 1

  if [ $i -eq 30 ]; then
    echo "MongoDB 서버가 응답하지 않습니다. 초기화를 중단합니다."
    exit 1
  fi
done

echo "MongoDB 레플리카 세트 초기화 중..."

# 현재 레플리카 상태 확인
STATUS=$(docker exec mongodb mongosh -u root -p 'qwer123!@#' --authenticationDatabase admin --quiet --eval 'try { rs.status().ok } catch(e) { 0 }')

if [ "$STATUS" = "1" ]; then
  echo "레플리카 세트가 이미 구성되어 있습니다."
  docker exec mongodb mongosh -u root -p 'qwer123!@#' --authenticationDatabase admin --eval 'rs.status()'
  exit 0
fi

# 레플리카 세트 초기화
echo "레플리카 세트 초기화 중..."
INIT_RESULT=$(docker exec mongodb mongosh -u root -p 'qwer123!@#' --authenticationDatabase admin --eval 'rs.initiate({_id: "rs0", members: [{_id: 0, host: "localhost:27017"}]})')

echo "$INIT_RESULT"

# PRIMARY 상태 대기
echo "레플리카 세트가 PRIMARY 상태가 될 때까지 대기 중..."
for i in {1..30}; do
  STATUS=$(docker exec mongodb mongosh -u root -p 'qwer123!@#' --authenticationDatabase admin --quiet --eval 'try { rs.status().members[0].stateStr } catch(e) { "UNKNOWN" }')

  if [ "$STATUS" = "PRIMARY" ]; then
    echo "레플리카 세트가 PRIMARY 상태가 되었습니다. 초기화가 완료되었습니다."
    exit 0
  fi

  echo "현재 상태: $STATUS, 대기 중... ($i/30)"
  sleep 2

  if [ $i -eq 30 ]; then
    echo "타임아웃: 레플리카 세트가 PRIMARY 상태가 되지 않았습니다."
    docker exec mongodb mongosh -u root -p 'qwer123!@#' --authenticationDatabase admin --eval 'rs.status()'
    exit 1
  fi
done