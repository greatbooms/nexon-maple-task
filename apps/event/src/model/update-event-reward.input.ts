import { Field, InputType, OmitType } from '@nestjs/graphql'
import { IsString } from 'class-validator'
import { EventRewardInput } from './event-reward.input'

@InputType({ description: '이벤트 보상 수정 입력' })
export class UpdateEventRewardInput extends OmitType(EventRewardInput, ['eventId']) {
  @Field(() => String, { nullable: false, description: '보상 ID' })
  @IsString()
  override id!: string
}