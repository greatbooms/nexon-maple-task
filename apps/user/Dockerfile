FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --production

COPY . .

RUN npx nx build user --skip-nx-cache

FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist/apps/user ./apps/user
COPY --from=builder /usr/src/app/apps/user/src/prisma/schema.prisma ./apps/user/src/prisma/schema.prisma
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist/apps/user/package.json ./package.json

EXPOSE 3200

COPY ./apps/user/start.sh ./
RUN chmod +x ./start.sh

# 애플리케이션 실행 명령어
CMD ["./start.sh"]