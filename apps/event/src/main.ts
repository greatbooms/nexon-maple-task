/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'
import * as process from 'node:process'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = process.env.PORT || 3300
  app.enableCors()
  await app.listen(port)
}

bootstrap().then(()=> console.log(`🚀 Event service is running on: ${process.env.PORT || 3300}`))
