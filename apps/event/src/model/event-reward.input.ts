import { Field, InputType, Int } from '@nestjs/graphql'
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator'
import { EventRewardType } from '@maple/models'

@InputType({ description: '이벤트 보상 입력' })
export class EventRewardInput {
  @Field(() => String, { nullable: true, description: '보상 ID' })
  @IsOptional()
  @IsString()
  id?: string

  @Field(() => String, { nullable: true, description: '이벤트 ID' })
  @IsOptional()
  @IsString()
  eventId?: string

  @Field(() => EventRewardType, { nullable: true, description: '보상 타입' })
  @IsOptional()
  @IsEnum(EventRewardType)
  rewardType?: EventRewardType

  @Field(() => Int, { nullable: true, description: '보상 수량' })
  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number

  @Field(() => Int, { nullable: true, description: '보상 선택 가중치' })
  @IsOptional()
  @IsInt()
  @Min(1)
  weight?: number

  @Field(() => String, { nullable: true, description: '참조 아이디 (포인트, 아이템, 쿠폰 등의 ID)' })
  @IsOptional()
  @IsString()
  referenceId?: string

  @Field(() => Boolean, { nullable: true, description: '삭제 여부' })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean
}