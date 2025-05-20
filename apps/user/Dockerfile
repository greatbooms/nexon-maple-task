# 스테이지 1: 런타임 환경 준비 및 프로덕션 의존성 설치
FROM node:18-alpine AS runtime_prep
WORKDIR /usr/src/app

# 1. 호스트의 dist 폴더에서 모든 미리 빌드된 아티팩트들을 복사합니다.
COPY dist /usr/src/app


EXPOSE 3000

# USER node 명령어는 파일 시스템 변경 작업 (mkdir, cp 등) 이후에 오는 것이 좋습니다.
# chown을 사용하여 node 사용자가 새로 생성/복사된 파일에 접근 가능하도록 합니다.
RUN chown -R node:node /usr/src/app/node_modules/@maple

USER node

# 앱 시작 (main.js가 /usr/src/app/main.js에 있다고 가정)
CMD ["node", "main.js"]