import { Field, Int, ObjectType, Directive } from "@nestjs/graphql"

@ObjectType()
export class PageInfo {
  @Field(() => Int)
  @Directive('@shareable')
  total!: number

  @Field(() => Int)
  @Directive('@shareable')
  page!: number

  @Field(() => Int)
  @Directive('@shareable')
  take!: number

  @Field(() => Boolean)
  @Directive('@shareable')
  hasNextPage!: boolean

  @Field(() => Int)
  @Directive('@shareable')
  totalPages!: number
}