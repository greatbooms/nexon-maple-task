import { Field, InputType, OmitType } from '@nestjs/graphql'
import { IsEmail, IsString, MinLength } from 'class-validator'
import { UserInput } from './user.input'

@InputType({ description: '로그인' })
export class SignInInput extends OmitType(UserInput, ['id', 'name', 'role']) {
  @Field(() => String, { nullable: false, description: '비밀번호' })
  @IsString()
  @MinLength(8)
  override password!: string

  @Field(() => String, { nullable: false, description: '이메일' })
  @IsEmail()
  override email!: string
}
