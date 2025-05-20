import { Module } from '@nestjs/common'
import { UserEventParticipationHistoryService } from './user-event-participation-history.service'
import { UserEventParticipationHistoryResolver } from './user-event-participation-history.resolver'
import { UserModule } from '../user/user.module'
import { EventModule } from '../event/event.module'
import { EventRewardModule } from '../event-reward/event-reward.module'

@Module({
  imports: [UserModule, EventModule, EventRewardModule],
  providers: [UserEventParticipationHistoryResolver, UserEventParticipationHistoryService],
})
export class UserEventParticipationHistoryModule {}
