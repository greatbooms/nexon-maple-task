import { ArgsType, Field } from '@nestjs/graphql'
import { IsOptional, IsString } from 'class-validator'
import { PageSearchArgs } from '@maple/models'
import { ParticipationResult } from '@maple/models'

@ArgsType()
export class UserEventParticipationHistoriesArgs extends PageSearchArgs {
  @Field(() => String, { nullable: true, description: '이벤트 ID로 필터링' })
  @IsOptional()
  @IsString()
  eventId?: string

  @Field(() => String, { nullable: true, description: '유저 ID로 필터링' })
  @IsOptional()
  @IsString()
  userId?: string

  @Field(() => String, { nullable: true, description: '이벤트 보상 ID로 필터링' })
  @IsOptional()
  @IsString()
  rewardId?: string

  @Field(() => ParticipationResult, { nullable: true, description: '참여 결과로 필터링' })
  @IsOptional()
  result?: ParticipationResult
}
