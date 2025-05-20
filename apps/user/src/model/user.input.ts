import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { UserRole } from '@maple/models'

@InputType({ description: '사용자 정보 입력 베이스' })
export class UserInput {
  @Field(() => String, { nullable: true, description: '사용자 ID' })
  @IsOptional()
  @IsString()
  id?: string

  @Field(() => String, { nullable: true, description: '이름' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string

  @Field(() => String, { nullable: true, description: '비밀번호' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string

  @Field(() => String, { nullable: true, description: '이메일' })
  @IsOptional()
  @IsEmail()
  email?: string

  @Field(() => UserRole, { nullable: true, description: '역할' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole
}
