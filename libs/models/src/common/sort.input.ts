import { Field, InputType } from "@nestjs/graphql"
import { IsBoolean } from "class-validator"

@InputType({ description: '정렬 입력' })
export class SortInput {
  @Field(() => String, { description: '정렬할 필드명' })
  field!: string

  @Field(() => Boolean, {
    description: '정렬 방향 (true: 오름차순/ASC, false: 내림차순/DESC)'
  })
  @IsBoolean()
  direction!: boolean
}