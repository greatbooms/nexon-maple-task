import { ArgsType, Field, Int } from '@nestjs/graphql'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { PageSearchArgs } from '@maple/models'
import { EventRewardType } from '@maple/models'

@ArgsType()
export class EventRewardsArgs extends PageSearchArgs {
  @Field(() => String, { nullable: true, description: '이벤트 ID로 필터링' })
  @IsOptional()
  @IsString()
  eventId?: string

  @Field(() => EventRewardType, { nullable: true, description: '보상 타입으로 필터링' })
  @IsOptional()
  @IsEnum(EventRewardType)
  rewardType?: EventRewardType

  @Field(() => Int, { nullable: true, description: '최소 보상 수량' })
  @IsOptional()
  minQuantity?: number

  @Field(() => Int, { nullable: true, description: '최대 보상 수량' })
  @IsOptional()
  maxQuantity?: number

  @Field(() => Int, { nullable: true, description: '최소 가중치' })
  @IsOptional()
  minWeight?: number

  @Field(() => Int, { nullable: true, description: '최대 가중치' })
  @IsOptional()
  maxWeight?: number

  @Field(() => String, { nullable: true, description: '참조 ID로 필터링' })
  @IsOptional()
  @IsString()
  referenceId?: string
}
