import { ArgsType, Field } from "@nestjs/graphql"
import { IsBoolean, IsDate, IsOptional, IsString } from "class-validator"
import { PageSearchArgs } from '@maple/models'
import { EventType } from '@maple/models'

@ArgsType()
export class EventsArgs extends PageSearchArgs {
  @Field(() => String, { nullable: true, description: "이벤트 제목" })
  @IsOptional()
  @IsString()
  title?: string

  @Field(() => EventType, { nullable: true, description: "이벤트 타입" })
  @IsOptional()
  type?: EventType

  @Field(() => Date, { nullable: true, description: "시작일 이후" })
  @IsOptional()
  @IsDate()
  startAt?: Date

  @Field(() => Date, { nullable: true, description: "종료일 이전" })
  @IsOptional()
  @IsDate()
  endAt?: Date

  @Field(() => Boolean, { nullable: true, description: "활성화 상태" })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}