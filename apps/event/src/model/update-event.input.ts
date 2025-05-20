import { Field, InputType } from '@nestjs/graphql'
import { IsArray, IsString, ValidateNested } from 'class-validator'
import { EventInput } from './event.input'
import { EventRewardInput } from './event-reward.input'

@InputType({ description: '이벤트 수정 입력' })
export class UpdateEventInput extends EventInput {
  @Field(() => String, { nullable: false, description: '이벤트 ID' })
  @IsString()
  override id!: string

  @Field(() => [EventRewardInput], { nullable: false, description: '이벤트 보상 목록' })
  @IsArray()
  @ValidateNested({ each: true })
  override eventRewards!: EventRewardInput[]
}