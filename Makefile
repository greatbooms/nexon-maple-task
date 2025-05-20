.PHONY: setup start-db start-services start stop status init restart clean help seed-data all

help:
	@echo "MongoDB 레플리카 세트 관리 명령어:"
	@echo " make setup - 키파일 생성 및 스크립트에 실행 권한 부여"
	@echo " make start-db - MongoDB 컨테이너만 시작"
	@echo " make init - 레플리카 세트 초기화"
	@echo " make start-services - 마이크로서비스 컨테이너들 시작"
	@echo " make start - 모든 컨테이너 시작 (DB 초기화 없이)"
	@echo " make status - 레플리카 세트 상태 확인"
	@echo " make stop - 모든 컨테이너 중지"
	@echo " make restart - 모든 컨테이너 재시작"
	@echo " make clean - 모든 컨테이너와 볼륨 제거"
	@echo " make seed-data - 샘플 데이터 생성"
	@echo " make all - 전체 설정 및 샘플 데이터 생성 (순차적 시작)"

setup:
	@echo "MongoDB 설정 시작..."
	@if [ ! -f mongodb-keyfile ]; then \
		echo "MongoDB 키파일 생성 중..."; \
		openssl rand -base64 756 > mongodb-keyfile; \
		chmod 400 mongodb-keyfile; \
		echo "키파일이 생성되었습니다."; \
	else \
		echo "키파일이 이미 존재합니다. 생성 단계를 건너뜁니다."; \
	fi
	@if [ ! -x init-replicaset.sh ]; then \
		echo "초기화 스크립트에 실행 권한 부여 중..."; \
		chmod +x init-replicaset.sh; \
	else \
		echo "초기화 스크립트에 이미 실행 권한이 있습니다."; \
	fi
	@if [ ! -x seed-data.sh ]; then \
		echo "시드 데이터 스크립트에 실행 권한 부여 중..."; \
		chmod +x seed-data.sh; \
	fi
	@echo "설정 완료!"

start-db:
	@echo "MongoDB 컨테이너만 시작 중..."
	@docker-compose up -d mongodb
	@echo "MongoDB 컨테이너가 시작되었습니다."

start-services:
	@echo "마이크로서비스 컨테이너 시작 중..."
	@docker-compose up -d user-service event-service gateway-service
	@echo "마이크로서비스 컨테이너가 시작되었습니다."

start:
	@echo "모든 컨테이너 시작 중..."
	@docker-compose up -d
	@echo "모든 컨테이너가 시작되었습니다."

init:
	@echo "레플리카 세트 초기화 중..."
	@./init-replicaset.sh
	@echo "초기화 완료. 레플리카 세트가 준비되었습니다."

status:
	@docker exec -it mongodb mongosh -u root -p 'qwer123!@#' --authenticationDatabase admin --eval 'rs.status()'

stop:
	@echo "모든 컨테이너 중지 중..."
	@docker-compose down
	@echo "모든 컨테이너가 중지되었습니다."

restart: stop start

clean: stop
	@echo "MongoDB 볼륨 제거 중..."
	@docker volume rm $$(docker volume ls -q | grep mongodb_data) || true
	@echo "모든 데이터가 제거되었습니다."

seed-data:
	@echo "MongoDB에 샘플 데이터 생성 중..."
	@if [ ! -x seed-data.sh ]; then \
		echo "스크립트에 실행 권한 부여 중..."; \
		chmod +x seed-data.sh; \
	fi
	@docker cp seed-data.js mongodb:/data/
	@./seed-data.sh
	@echo "샘플 데이터가 생성되었습니다."

# 순차적 실행을 위한 전체 설정 명령어
all: setup start-db
	@echo "MongoDB 시작 후 초기화 전 10초 대기..."
	@sleep 10
	@make init
	@echo "레플리카 세트 초기화 후 5초 대기..."
	@sleep 5
	@make start-services
	@echo "서비스 시작 후 5초 대기..."
	@sleep 5
	@make seed-data
	@echo "MongoDB 레플리카 세트와 모든 서비스가 순차적으로 설정되었고, 샘플 데이터가 생성되었습니다!"
	@echo "다음 연결 문자열을 사용하세요: mongodb://root:qwer123%21%40%23@localhost:27017/maple?authSource=admin&replicaSet=rs0"