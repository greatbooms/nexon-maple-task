import { ObjectType, Field, ID, GraphQLISODateTime, Int, Directive } from '@nestjs/graphql'
import { EventType } from '@maple/models'
import GraphQLJSON from 'graphql-type-json'

@ObjectType({ description: '이벤트' })
@Directive('@key(fields: "id")')
export class Event {
  @Field(() => ID, { description: '이벤트 아이디' })
  id!: string

  @Field(() => GraphQLISODateTime, { description: '이벤트 시작 일시' })
  @Directive('@shareable')
  startAt!: Date

  @Field(() => GraphQLISODateTime, { description: '이벤트 종료 일시' })
  @Directive('@shareable')
  endAt!: Date

  @Field(() => EventType, { description: '이벤트 타입' })
  @Directive('@shareable')
  type!: EventType

  @Field(() => String, { description: '이벤트 제목' })
  @Directive('@shareable')
  title!: string

  @Field(() => String, { nullable: true, description: '이벤트 설명' })
  @Directive('@shareable')
  description?: string

  @Field(() => GraphQLJSON, { nullable: true, description: '이벤트 참여 조건 (JSON 형식)' })
  @Directive('@shareable')
  condition?: any

  @Field(() => Boolean, { description: '중복 보상 가능 여부' })
  @Directive('@shareable')
  isDuplicated!: boolean

  @Field(() => Int, { description: '총 보상 수량' })
  @Directive('@shareable')
  totalReward!: number

  @Field(() => String, { nullable: true, description: '이벤트 이미지 URL' })
  @Directive('@shareable')
  imageUrl?: string

  @Field(() => Boolean, { description: '활성화 상태' })
  @Directive('@shareable')
  isActive!: boolean

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