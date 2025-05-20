import { Field, GraphQLISODateTime, InputType, Int } from '@nestjs/graphql'
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator'
import { EventType } from '@maple/models'
import GraphQLJSON from 'graphql-type-json'
import { EventRewardInput } from './event-reward.input'

@InputType({ description: '이벤트 입력' })
export class EventInput {
  @Field(() => String, { nullable: true, description: '이벤트 ID' })
  @IsOptional()
  @IsString()
  id?: string

  @Field(() => GraphQLISODateTime, { nullable: true, description: '이벤트 시작 일시' })
  @IsOptional()
  @IsDate()
  startAt?: Date

  @Field(() => GraphQLISODateTime, { nullable: true, description: '이벤트 종료 일시' })
  @IsOptional()
  @IsDate()
  endAt?: Date

  @Field(() => EventType, { nullable: true, description: '이벤트 타입' })
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType

  @Field(() => String, { nullable: true, description: '이벤트 제목' })
  @IsOptional()
  @IsString()
  title?: string

  @Field(() => String, { nullable: true, description: '이벤트 설명' })
  @IsOptional()
  @IsString()
  description?: string

  @Field(() => GraphQLJSON, { nullable: true, description: '이벤트 참여 조건 (JSON 형식)' })
  @IsOptional()
  @IsObject()
  condition?: any

  @Field(() => Boolean, { nullable: true, description: '중복 보상 가능 여부' })
  @IsOptional()
  @IsBoolean()
  isDuplicated?: boolean

  @Field(() => Int, { nullable: true, description: '총 보상 수량' })
  @IsOptional()
  @IsInt()
  totalReward?: number

  @Field(() => String, { nullable: true, description: '이벤트 이미지 URL' })
  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string

  @Field(() => Boolean, { nullable: true, description: '활성화 상태' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @Field(() => Boolean, { nullable: true, description: '삭제 여부' })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean

  @Field(() => [EventRewardInput], { nullable: false, description: '이벤트 보상 목록' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  eventRewards!: EventRewardInput[]
}