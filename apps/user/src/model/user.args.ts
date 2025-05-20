import { ArgsType, Field } from '@nestjs/graphql'
import { IsOptional, IsString } from 'class-validator'

@ArgsType()
export class UserArgs {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  id?: string
}