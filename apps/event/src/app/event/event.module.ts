import { Module } from '@nestjs/common'
import { EventService } from './event.service'
import { EventResolver } from './event.resolver'
import { EventRewardModule } from '../event-reward/event-reward.module'
import { EventLoader } from './event.loader'

@Module({
  imports: [EventRewardModule],
  providers: [EventResolver, EventService, EventLoader],
  exports: [EventService, EventLoader],
})
export class EventModule {}
