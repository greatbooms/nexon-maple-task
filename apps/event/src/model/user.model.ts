import { Directive, Field, ID, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: '사용자' })
@Directive('@key(fields: "id")')
@Directive('@extends')
export class User {
  @Field(() => ID, { description: '아이디' })
  @Directive('@external')
  id!: string
}