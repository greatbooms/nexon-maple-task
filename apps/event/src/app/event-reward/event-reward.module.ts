import { Module } from '@nestjs/common'
import { EventRewardService } from './event-reward.service'
import { EventRewardResolver } from './event-reward.resolver'
import { EventRewardLoader } from './event-reward.loader'

@Module({
  providers: [EventRewardResolver, EventRewardService, EventRewardLoader],
  exports: [EventRewardService, EventRewardLoader],
})
export class EventRewardModule {}
