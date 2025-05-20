import { Global, Module } from '@nestjs/common'
import { EventPrismaService } from './prisma.service'

@Global()
@Module({
  providers: [EventPrismaService],
  exports: [EventPrismaService],
})
export class EventPrismaModule {}
