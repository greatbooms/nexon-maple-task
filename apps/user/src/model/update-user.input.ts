import { InputType, OmitType } from '@nestjs/graphql'
import { UserInput } from './user.input'

@InputType({ description: '사용자 정보 입력 베이스' })
export class UpdateUserInput extends OmitType(UserInput, ['password']) {}
