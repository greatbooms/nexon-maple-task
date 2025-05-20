/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'
import { ConfigService } from '@nestjs/config'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)

  // 마이크로서비스 설정 (내부 통신용)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: configService.get('USER_MICRO_SERVICE_HOST', 'localhost'),
      port: configService.get('USER_MICRO_SERVICE_PORT', 3010),
    },
  })

  // 마이크로서비스 시작
  await app.startAllMicroservices()

  // HTTP 서버 시작
  const port = process.env.PORT || 3200
  app.enableCors()
  await app.listen(port)
}

bootstrap().then(() => console.log(`🚀 User service is running on: ${process.env.PORT || 3200}`))
