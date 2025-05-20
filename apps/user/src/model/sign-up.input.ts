import { Field, InputType, OmitType } from '@nestjs/graphql'
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator'
import { UserRole } from '@maple/models'
import { UserInput } from './user.input'

@InputType({ description: '회원가입' })
export class SignUpInput extends OmitType(UserInput, ['id']) {
  @Field(() => String, { nullable: false, description: '비밀번호' })
  @IsString()
  @MinLength(8)
  override password!: string

  @Field(() => String, { nullable: false, description: '이메일' })
  @IsEmail()
  override email!: string

  @Field(() => UserRole, { nullable: false, description: '역할' })
  @IsEnum(UserRole)
  override role!: UserRole
}
