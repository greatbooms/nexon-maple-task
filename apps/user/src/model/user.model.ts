import { Directive, Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql'
import { UserRole } from '@maple/models'

@ObjectType({ description: '사용자' })
@Directive('@key(fields: "id")')
export class User {
  @Field(() => ID, { nullable: false, description: '아이디' })
  id!: string

  @Field(() => String, { nullable: true, description: '이름' })
  @Directive('@shareable')
  name?: string

  @Field(() => String, { nullable: false, description: '이메일' })
  @Directive('@shareable')
  email!: string

  @Field(() => UserRole, { nullable: false, description: '역할' })
  @Directive('@shareable')
  role!: UserRole

  @Field(() => GraphQLISODateTime, { nullable: true, description: '생성일자' })
  @Directive('@shareable')
  createdAt?: Date

  @Field(() => GraphQLISODateTime, { nullable: true, description: '수정일자' })
  @Directive('@shareable')
  updatedAt?: Date
}