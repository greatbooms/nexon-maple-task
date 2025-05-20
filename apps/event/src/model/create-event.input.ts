import { Field, GraphQLISODateTime, InputType, Int, OmitType } from '@nestjs/graphql'
import { IsArray, IsBoolean, IsDate, IsEnum, IsInt, IsString, ValidateNested } from 'class-validator'
import { EventType } from '@maple/models'
import { EventInput } from './event.input'
import { CreateEventRewardInput } from './create-event-reward.input'

@InputType({ description: '이벤트 생성 입력' })
export class CreateEventInput extends OmitType(EventInput, ['id', 'isDeleted']) {
  @Field(() => GraphQLISODateTime, { nullable: false, description: '이벤트 시작 일시' })
  @IsDate()
  override startAt!: Date

  @Field(() => GraphQLISODateTime, { nullable: false, description: '이벤트 종료 일시' })
  @IsDate()
  override endAt!: Date

  @Field(() => EventType, { nullable: false, description: '이벤트 타입' })
  @IsEnum(EventType)
  override type!: EventType

  @Field(() => String, { nullable: false, description: '이벤트 제목' })
  @IsString()
  override title!: string

  @Field(() => Boolean, { nullable: false, description: '중복 보상 가능 여부' })
  @IsBoolean()
  override isDuplicated!: boolean

  @Field(() => Int, { nullable: false, description: '총 보상 수량' })
  @IsInt()
  override totalReward!: number

  @Field(() => Boolean, { nullable: false, description: '활성화 상태' })
  @IsBoolean()
  override isActive!: boolean

  // 이벤트 보상 (배열로 여러 개 받을 수 있도록 수정)
  @Field(() => [CreateEventRewardInput], { nullable: false, description: '이벤트 보상 목록' })
  @IsArray()
  @ValidateNested({ each: true })
  override eventRewards!: CreateEventRewardInput[]
}