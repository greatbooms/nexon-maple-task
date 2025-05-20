FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --production

COPY . .

RUN npx nx build event --skip-nx-cache

FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist/apps/event ./apps/event
COPY --from=builder /usr/src/app/apps/event/src/prisma/schema.prisma ./apps/event/src/prisma/schema.prisma
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist/apps/event/package.json ./package.json

EXPOSE 3300

COPY ./apps/event/start.sh ./
RUN chmod +x ./start.sh

# 애플리케이션 실행 명령어
CMD ["./start.sh"]