import { ObjectType } from '@nestjs/graphql'
import { Paginated } from '@maple/models'
import { EventReward } from './event-reward.model'

@ObjectType({ description: '이벤트 보상 목록 리스트' })
export class EventRewards extends Paginated(EventReward) {}
