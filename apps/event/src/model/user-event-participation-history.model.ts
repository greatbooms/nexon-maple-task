import { ObjectType, Field, ID, GraphQLISODateTime, Directive } from '@nestjs/graphql'
import { ParticipationResult } from '@maple/models'

@ObjectType({ description: '사용자 이벤트 참여 이력' })
@Directive('@key(fields: "id")')
export class UserEventParticipationHistory {
  @Field(() => ID, { description: '참여 이력 아이디' })
  id!: string

  @Field(() => String, { description: '사용자 아이디' })
  @Directive('@shareable')
  userId!: string

  @Field(() => String, { description: '이벤트 아이디' })
  @Directive('@shareable')
  eventId!: string

  @Field(() => String, { nullable: true, description: '보상 아이디' })
  @Directive('@shareable')
  rewardId?: string

  @Field(() => ParticipationResult, { description: '참여 결과 상태' })
  @Directive('@shareable')
  result!: ParticipationResult

  @Field(() => String, { nullable: true, description: '참여 결과 상세 정보' })
  @Directive('@shareable')
  resultDetail?: string

  @Field(() => GraphQLISODateTime, { description: '생성 일시' })
  @Directive('@shareable')
  createdAt!: Date

  @Field(() => GraphQLISODateTime, { description: '수정 일시' })
  @Directive('@shareable')
  updatedAt!: Date
}