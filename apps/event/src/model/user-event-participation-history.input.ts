import { Field, InputType } from '@nestjs/graphql'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { ParticipationResult } from '@maple/models'

@InputType({ description: '사용자 이벤트 참여 내역 입력' })
export class UserEventParticipationHistoryInput {
  @Field(() => String, { nullable: true, description: '참여 내역 ID' })
  @IsOptional()
  @IsString()
  id?: string

  @Field(() => String, { nullable: true, description: '사용자 ID' })
  @IsOptional()
  @IsString()
  userId?: string

  @Field(() => String, { nullable: true, description: '이벤트 ID' })
  @IsOptional()
  @IsString()
  eventId?: string

  @Field(() => String, { nullable: true, description: '보상 ID' })
  @IsOptional()
  @IsString()
  rewardId?: string

  @Field(() => ParticipationResult, { nullable: true, description: '참여 결과 상태' })
  @IsOptional()
  @IsEnum(ParticipationResult)
  result?: ParticipationResult

  @Field(() => String, { nullable: true, description: '참여 결과 상세 정보' })
  @IsOptional()
  @IsString()
  resultDetail?: string
}