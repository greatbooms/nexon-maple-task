import { Field, InputType, OmitType } from '@nestjs/graphql'
import { IsString } from 'class-validator'
import { UserEventParticipationHistoryInput } from './user-event-participation-history.input'

@InputType({ description: '사용자 이벤트 참여 내역 생성 입력' })
export class CreateUserEventParticipationHistoryInput extends OmitType(UserEventParticipationHistoryInput, [
  'id',
  'rewardId',
  'userId',
  'result',
  'resultDetail',
]) {
  @Field(() => String, { nullable: false, description: '이벤트 ID' })
  @IsString()
  override eventId!: string
}