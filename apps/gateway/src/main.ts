import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'
import { ConfigService } from '@nestjs/config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  // CORS 설정
  app.enableCors()

  // 포트 설정
  const port = configService.get('PORT') || 3000

  await app.listen(port)

  Logger.log(`🚀 Gateway is running on: http://localhost:${port}/graphql`)
}

bootstrap().then()
