import { ObjectType } from '@nestjs/graphql'
import { Paginated } from '@maple/models'
import { UserEventParticipationHistory } from './user-event-participation-history.model'

@ObjectType({ description: '사용자 이벤트 참여 이력 리스트' })
export class UserEventParticipationHistories extends Paginated(UserEventParticipationHistory) {}
