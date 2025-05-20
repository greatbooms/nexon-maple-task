import { Field, InputType, OmitType } from '@nestjs/graphql'
import { IsEnum } from 'class-validator'
import { EventRewardType } from '@maple/models'
import { EventRewardInput } from './event-reward.input'

@InputType({ description: '이벤트 보상 생성 입력' })
export class CreateEventRewardInput extends OmitType(EventRewardInput, ['id', 'isDeleted']) {
  @Field(() => EventRewardType, { nullable: false, description: '보상 타입' })
  @IsEnum(EventRewardType)
  override rewardType!: EventRewardType
}
