import { ObjectType, Field, ID, Int, GraphQLISODateTime, Directive } from '@nestjs/graphql'
import { EventRewardType } from '@maple/models'

@ObjectType({ description: '이벤트 보상' })
@Directive('@key(fields: "id")')
export class EventReward {
  @Field(() => ID, { description: '보상 아이디' })
  id!: string

  @Field(() => String, { description: '이벤트 아이디' })
  @Directive('@shareable')
  eventId!: string

  @Field(() => EventRewardType, { description: '보상 타입' })
  @Directive('@shareable')
  rewardType!: EventRewardType

  @Field(() => Int, { description: '보상 수량' })
  @Directive('@shareable')
  quantity!: number

  @Field(() => Int, { description: '보상 선택 가중치' })
  @Directive('@shareable')
  weight!: number

  @Field(() => String, { nullable: true, description: '참조 테이블 이름 (포인트, 아이템, 쿠폰 등)' })
  @Directive('@shareable')
  referenceTable?: string

  @Field(() => String, { nullable: true, description: '참조 아이디 (포인트, 아이템, 쿠폰 등의 ID)' })
  @Directive('@shareable')
  referenceId?: string

  @Field(() => Boolean, { description: '삭제 여부' })
  @Directive('@shareable')
  isDeleted!: boolean

  @Field(() => GraphQLISODateTime, { description: '생성 일시' })
  @Directive('@shareable')
  createdAt!: Date

  @Field(() => GraphQLISODateTime, { description: '수정 일시' })
  @Directive('@shareable')
  updatedAt!: Date
}