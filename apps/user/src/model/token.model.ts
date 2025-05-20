import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: '토큰' })
export class Token {
  @Field(() => String, { nullable: false, description: '액세스 토큰' })
  accessToken!: string

  @Field(() => String, { nullable: true, description: '리프레쉬 토큰' })
  refreshToken?: string
}
